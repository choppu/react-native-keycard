import Foundation
import os.log

@objcMembers public class KeycardImp: NSObject {
  public enum Error: Swift.Error {
    case invalidAPDUResponse
  }

  var cardChannel: NFCCardChannel? = nil
  var nfcStartPrompt: String = "Hold your iPhone close to a Keycard"
  var onDisconnect: (() -> Void)? = nil

  // NFCReaderError.Code — transceive-level; the session survives these:
  //   100 readerTransceiveErrorTagConnectionLost   (status-keycard matches this)
  //   101 readerTransceiveErrorRetryExceeded       (degraded RF link — "move the card")
  //   102 readerTransceiveErrorTagResponseError    (status-keycard matches this;
  //                                                 the only code observed on-device)
  // Deliberately NOT included:
  //   103 readerTransceiveErrorSessionInvalidated  session already dead; restartPolling
  //                                                cannot recover it
  //   104 readerTransceiveErrorTagNotConnected     outside the field-proven set
  private static let tagLostCodes: Set<Int> = [100, 101, 102]

  private var _keycardController: Any? = nil

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
      if (keycardController == nil) {
        self.onDisconnect = onDisconnect
        self.keycardController = KeycardController(
          onConnect: {
            [unowned self] channel in
            // KeycardController invokes this on a background queue, so all UIKit /
            // RN-bridge work below must hop to main.
            self.cardChannel = channel

            let feedbackGenerator = UINotificationFeedbackGenerator()
            feedbackGenerator.prepare()

            DispatchQueue.main.async {
              feedbackGenerator.notificationOccurred(.success)
              onConnect()
              self.keycardController?.setAlert("Connected. Don't move your card.")
              os_log("[react-native-status-keycard] card connected")
            }
          },
          onFailure: {
            [unowned self] error in
            self.cardChannel = nil
            self.keycardController = nil

            os_log("[react-native-status-keycard] NFCError: %@", String(describing: error))

            if type(of: error) is NSError.Type {
              let nsError = error as NSError
              if nsError.code == 200 && nsError.domain == "NFCError" {
                onUserCancel()
              } else if (nsError.code == 201 || nsError.code == 202 || nsError.code == 203) && (nsError.domain == "NFCError") {
                // 202 (sessionTerminatedUnexpectedly) previously produced no
                // callback at all, stranding JS with the controller already
                // nil'd and Apple's sheet gone. Route it with the timeouts so
                // JS learns the session ended. Other unrecognised codes keep
                // today's behaviour deliberately.
                onTimeout();
              }
            }
          })

          self.nfcStartPrompt = prompt.isEmpty ? nfcStartPrompt : prompt
          keycardController?.start(alertMessage: self.nfcStartPrompt)

          return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(true) ]
        } else {
          return ["nfcStarted": NSNumber(true), "isSuccess": NSNumber(false) ]
        }
      } else {
          return ["nfcStarted": NSNumber(false), "isSuccess": NSNumber(true) ]
      }
  }

  public func stopNFC(_ err: String = "") -> NSNumber {
    if #available(iOS 13.0, *) {
        if (err.isEmpty) {
          self.keycardController?.stop(alertMessage: "Success")
        } else {
          self.keycardController?.stop(errorMessage: err)
        }
        self.cardChannel = nil
        self.keycardController = nil
        return NSNumber(true)
      } else {
        return NSNumber(false)
      }
  }

  public func setNFCMessage(_ message: String) -> NSNumber {
    if #available(iOS 13.0, *) {
        self.keycardController?.setAlert(message)
        return NSNumber(true)
      } else {
        return NSNumber(false)
      }
  }

  public func send(_ apdu: String) -> [String : String] {
    // Result does not flatten optionals the way `try?` does (SE-0230), so
    // success carries [UInt8]? and the .some/.none split below is mandatory:
    // a nil cardChannel (nil'd by onFailure racing a send) lands in
    // .success(.none), not in .failure.
    let outcome = Result { try self.cardChannel?.send(apdu) }

    switch outcome {
    case .success(.some(let apduResp)):
      os_log("[react-native-status-keycard] APDUResponse: %@", self.bytesToHex(apduResp))
      return ["data": bytesToHex(apduResp), "state": "success"]

    case .success(.none):
      // The channel is gone mid-exchange — the iOS mirror of Android's nulled
      // IsoDep. Recover the same way as a thrown tag loss.
      return tagLost(code: 100)

    case .failure(let error):
      let ns = error as NSError
      guard ns.domain == "NFCError", KeycardImp.tagLostCodes.contains(ns.code) else {
        // Today's behaviour, unchanged: a non-transceive error stays a
        // generic failure.
        return ["data": "", "state": "error"]
      }
      return tagLost(code: ns.code)
    }
  }

  // The card left the field mid-APDU. The session survives 1xx transceive
  // errors (verified on-device: restartPolling() recovered 4/4 re-taps on one
  // session), so restart polling, tell JS, and let the next tap resume.
  // Mirrors react-native-status-keycard's keycardInvokation error path.
  private func tagLost(code: Int) -> [String : String] {
    os_log("[react-native-status-keycard] tag lost (NFCError:%d), restarting polling", code)
    DispatchQueue.main.async {
      self.onDisconnect?()
    }
    if #available(iOS 13.0, *) {
      self.keycardController?.restartPolling()
      self.keycardController?.setAlert(self.nfcStartPrompt)
    }
    // "message" is only ever present on the error path, which the ObjC side
    // rejects rather than resolves — APDUData's resolved shape is untouched.
    return ["data": "", "state": "error", "message": "NFCError:\(code)"]
  }

  public func isKeycardConnected() -> NSNumber {
    return NSNumber(true)
  }
}
