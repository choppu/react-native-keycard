import Foundation
import os.log

@objcMembers public class KeycardImp: NSObject {
  public enum Error: Swift.Error {
    case invalidAPDUResponse
  }

  var cardChannel: NFCCardChannel? = nil
  var nfcStartPrompt: String = "Hold your iPhone close to a Keycard"
  var onDisconnect: (() -> Void)? = nil

  // transceive errors the reader session survives
  private static let tagLostCodes: Set<Int> = [100, 101, 102]

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
    if #available(iOS 13.0, *) {
      if (withStateLock { self.keycardController == nil }) {
        guard let controller = KeycardController(
          onConnect: {
            [weak self] channel in
            guard let self = self else { return }
            // KeycardController invokes this on a background queue, so all UIKit /
            // RN-bridge work below must hop to main.
            let currentController: KeycardController? = self.withStateLock {
              self.cardChannel = channel
              return self.keycardController
            }

            let feedbackGenerator = UINotificationFeedbackGenerator()
            feedbackGenerator.prepare()

            DispatchQueue.main.async {
              feedbackGenerator.notificationOccurred(.success)
              onConnect()
              currentController?.setAlert("Connected. Don't move your card.")
              os_log("[react-native-status-keycard] card connected")
            }
          },
          onFailure: {
            [weak self] error in
            guard let self = self else { return }
            self.withStateLock {
              self.cardChannel = nil
              self.keycardController = nil
            }

            os_log("[react-native-status-keycard] NFCError: %@", String(describing: error))

            if type(of: error) is NSError.Type {
              let nsError = error as NSError
              if nsError.code == 200 && nsError.domain == "NFCError" {
                onUserCancel()
              } else if (nsError.code == 201 || nsError.code == 202 || nsError.code == 203) && (nsError.domain == "NFCError") {
                onTimeout();
              }
            }
          }) else {
            return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(false) ]
          }

          self.onDisconnect = onDisconnect
          let installed: Bool = withStateLock {
            if self.keycardController == nil {
              self.keycardController = controller
              return true
            }
            return false
          }
          if !installed {
            return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(false) ]
          }
          self.nfcStartPrompt = prompt.isEmpty ? nfcStartPrompt : prompt
          controller.start(alertMessage: self.nfcStartPrompt)

          return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(true) ]
        } else {
          return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(false) ]
        }
      } else {
          return ["nfcStarted": NSNumber(false), "isSuccess": NSNumber(true) ]
      }
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

  public func send(_ apdu: String) -> [String : String] {
    let channel = withStateLock { self.cardChannel }
    let outcome = Result { try channel?.send(apdu) }

    switch outcome {
    case .success(.some(let apduResp)):
      os_log("[react-native-status-keycard] APDUResponse: %@", self.bytesToHex(apduResp))
      return ["data": bytesToHex(apduResp), "state": "success"]

    case .success(.none):
      return tagLost(code: 100)

    case .failure(let error):
      let ns = error as NSError
      guard ns.domain == "NFCError", KeycardImp.tagLostCodes.contains(ns.code) else {
        return ["data": "", "state": "error"]
      }
      return tagLost(code: ns.code)
    }
  }

  private func tagLost(code: Int) -> [String : String] {
    os_log("[react-native-status-keycard] tag lost (NFCError:%d), restarting polling", code)
    DispatchQueue.main.async {
      self.onDisconnect?()
    }
    if #available(iOS 13.0, *) {
      let controller: KeycardController? = withStateLock { self.keycardController }
      controller?.restartPolling()
      controller?.setAlert(self.nfcStartPrompt)
    }
    return ["data": "", "state": "error", "message": "NFCError:\(code)"]
  }

  public func isKeycardConnected() -> NSNumber {
    return NSNumber(true)
  }
}
