import Foundation
import os.log

@objcMembers public class KeycardImp: NSObject {
  var cardChannel: NFCCardChannel? = nil
  var nfcStartPrompt: String = "Hold your iPhone close to a Keycard"

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

  public func startNFC(_ prompt: String, onConnect: @escaping () -> Void, onUserCancel: @escaping () -> Void, onTimeout: @escaping () -> Void) -> NSDictionary {
    if #available(iOS 13.0, *) {
      if (keycardController == nil) {
        self.keycardController = KeycardController(
          onConnect: {
            [unowned self] channel in
            self.cardChannel = channel

            let feedbackGenerator = UINotificationFeedbackGenerator()
            feedbackGenerator.prepare()

            DispatchQueue.main.async {
              feedbackGenerator.notificationOccurred(.success)
            }

            onConnect()
            self.keycardController?.setAlert("Connected. Don't move your card.")
            os_log("[react-native-status-keycard] card connected")
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
              } else if (nsError.code == 201 || nsError.code == 203) && (nsError.domain == "NFCError") {
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

  public func stopNFC(_ err: String) -> NSNumber {
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
    guard let apduResp = try? self.cardChannel?.send(apdu) else {
        fatalError("Invalid response data")
    }

    var state: String = (apduResp != nil) ? "success" : "error";

    var response =  [
      "data": bytesToHex(apduResp),
      "state": state,
    ]

    os_log("[react-native-status-keycard] APDUResponse: %@", self.bytesToHex(apduResp))
    return response
  }

  public func isKeycardConnected() -> NSNumber {
    return NSNumber(true)
  }
}
