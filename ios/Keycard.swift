import Foundation
import UIKit
import os.log

@objcMembers public class KeycardImp: NSObject {
  var cardChannel: NFCCardChannel? = nil
  var nfcStartPrompt: String = "Hold your iPhone close to a Keycard"
  var onDisconnect: (() -> Void)? = nil

  static let TAG_LOST: String = "Tag was lost."
  // must match KeycardModule.TAG_LOST_CODE
  static let TAG_LOST_CODE: String = "KEYCARD_TAG_LOST"

  private static let nfcErrorDomain: String = "NFCError"

  private static let nfcTagNotFound = 100
  private static let nfcTagLost = 101
  private static let nfcTagNotAvailable = 102
  private static let tagLostCodes: Set<Int> = [nfcTagNotFound, nfcTagLost, nfcTagNotAvailable]

  // codes that invalidate the reader session
  private static let nfcTagConnectFailed = 200
  private static let nfcOperationNotAvailable = 201
  private static let nfcOperationTimeout = 202
  private static let nfcOperationCancelled = 203

  private var _keycardController: Any? = nil

  // never held across a CoreNFC call
  private let stateLock = NSLock()

  private func withStateLock<T>(_ body: () -> T) -> T {
    stateLock.lock()
    defer { stateLock.unlock() }
    return body()
  }

  @available(iOS 13.0, *)
  private var keycardController: KeycardController? {
    get {
      return _keycardController as? KeycardController
    }

    set(kc) {
      _keycardController = kc
    }
  }

  func bytesToHex(_ bytes: [UInt8]) -> String {
    return bytes.map { String(format: "%02hhx", $0) }.joined()
  }

  public func isNFCSupported() -> Bool {
    var val: Bool! = nil

    if #available(iOS 13.0, *) {
        val = KeycardController.isAvailable
    } else {
        val = false
    }

    return val
  }

  public func isNFCEnabled() -> Bool {
    return isNFCSupported()
  }

  public func startNFC(_ prompt: String, onConnect: @escaping () -> Void, onUserCancel: @escaping () -> Void, onTimeout: @escaping () -> Void, onDisconnect: @escaping () -> Void) -> NSDictionary {
    guard #available(iOS 13.0, *) else {
      return ["status": "unavailable"]
    }

    if withStateLock({ self.keycardController != nil }) {
      return ["status": "already_started"]
    }

    guard let controller = KeycardController(
      onConnect: {
        [weak self] channel in
        guard let self = self else { return }
        // onConnect runs on a background queue: hop to main for UIKit / RN-bridge work
        // tag may have left the field while connecting: don't install a stale channel
        guard channel.connected else { return }
        let currentController: KeycardController? = self.withStateLock {
          guard self.keycardController != nil else { return nil }
          self.cardChannel = channel
          return self.keycardController
        }
        guard currentController != nil else { return }

        let feedbackGenerator = UINotificationFeedbackGenerator()
        feedbackGenerator.prepare()

        DispatchQueue.main.async {
          feedbackGenerator.notificationOccurred(.success)
          onConnect()
          currentController?.setAlert("Connected. Don't move your card.")
          os_log("[react-native-status-keycard] card connected")
        }
      },
      onTagDisconnect: {
        [weak self] in
        // the controller has already restarted polling
        self?.cardLost(restartPolling: false)
      },
      onFailure: {
        [weak self] error in
        guard let self = self else { return }
        let hadChannel: Bool = self.withStateLock {
          let had = self.cardChannel != nil
          self.cardChannel = nil
          self.keycardController = nil
          return had
        }

        os_log("[react-native-status-keycard] NFCError: %@", String(describing: error))

        if type(of: error) is NSError.Type {
          let nsError = error as NSError
          if nsError.domain == KeycardImp.nfcErrorDomain {
            switch nsError.code {
            case KeycardImp.nfcTagConnectFailed, KeycardImp.nfcOperationCancelled:
              onUserCancel()
            case KeycardImp.nfcOperationNotAvailable, KeycardImp.nfcOperationTimeout:
              onTimeout()
            default:
              break
            }
          }
        }

        // session invalidated while a card was connected: the card is gone too, notify disconnect as well
        if hadChannel {
          DispatchQueue.main.async {
            self.onDisconnect?()
          }
        }
      }) else {
      return ["status": "unavailable"]
    }

    // re-check under the lock: startNFC may be re-entered while we build the controller
    let installed: Bool = withStateLock {
      if self.keycardController == nil {
        self.keycardController = controller
        return true
      }
      return false
    }
    guard installed else {
      return ["status": "already_started"]
    }

    self.onDisconnect = onDisconnect
    self.nfcStartPrompt = prompt.isEmpty ? nfcStartPrompt : prompt
    controller.start(alertMessage: self.nfcStartPrompt)

    return ["status": "started"]
  }

  public func stopNFC(_ message: String = "", isError: Bool = false) -> NSNumber {
    if #available(iOS 13.0, *) {
        let controller: KeycardController? = withStateLock {
          let current = self.keycardController
          self.cardChannel = nil
          self.keycardController = nil
          return current
        }
        if (isError) {
          controller?.stop(errorMessage: message)
        } else {
          controller?.stop(alertMessage: message.isEmpty ? "Success" : message)
        }
        return NSNumber(true)
      } else {
        return NSNumber(false)
      }
  }

  public func setNFCMessage(_ message: String) -> NSNumber {
    if #available(iOS 13.0, *) {
        let controller: KeycardController? = withStateLock { self.keycardController }
        controller?.setAlert(message)
        return NSNumber(true)
      } else {
        return NSNumber(false)
      }
  }

  private func tagLostResponse() -> [String : String] {
    return ["data": "", "state": "error", "message": KeycardImp.TAG_LOST, "code": KeycardImp.TAG_LOST_CODE]
  }

  // edge-triggered: only the first tag-loss report for a channel acts, so poll and APDU timeout can't double-fire the disconnect
  private func cardLost(code: Int? = nil, restartPolling: Bool = true) {
    let lost: Bool = withStateLock {
      guard self.cardChannel != nil else { return false }
      self.cardChannel = nil
      return true
    }
    guard lost else { return }

    if let code = code {
      os_log("[react-native-status-keycard] tag lost (NFCError:%d), restarting polling", code)
    } else {
      os_log("[react-native-status-keycard] tag lost, restarting polling")
    }

    DispatchQueue.main.async {
      self.onDisconnect?()
    }

    if #available(iOS 13.0, *) {
      let controller: KeycardController? = withStateLock { self.keycardController }
      if restartPolling {
        controller?.restartPolling()
      }
      controller?.setAlert(self.nfcStartPrompt)
    }
  }

  public func send(_ apdu: String) -> [String : String] {
    let channel = withStateLock { self.cardChannel }
    guard let channel = channel else {
      cardLost(code: KeycardImp.nfcTagNotFound)
      return tagLostResponse()
    }

    do {
      let apduResp = try channel.send(apdu)
      return ["data": bytesToHex(apduResp), "state": "success"]
    } catch NFCCardChannel.Error.transceiveTimeout {
      cardLost()
      return tagLostResponse()
    } catch {
      let ns = error as NSError
      guard ns.domain == KeycardImp.nfcErrorDomain, KeycardImp.tagLostCodes.contains(ns.code) else {
        return ["data": "", "state": "error"]
      }
      cardLost(code: ns.code)
      return tagLostResponse()
    }
  }

  public func isKeycardConnected() -> NSNumber {
    return withStateLock {
      guard let channel = self.cardChannel else { return NSNumber(false) }
      return NSNumber(value: channel.connected)
    }
  }
}
