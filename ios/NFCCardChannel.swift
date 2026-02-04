import Foundation
import CoreNFC
import os.log

@available(iOS 13.0, *)
public class NFCCardChannel: NSObject {
    public enum Error: Swift.Error {
        case invalidAPDU
    }

    private let tag: NFCISO7816Tag

    public init(tag: NFCISO7816Tag) {
        self.tag = tag
    }

    public var connected: Bool {
        return tag.isAvailable
    }

    func hexStringToBytes(_ hex: String) -> [UInt8] {
      let h = hex.starts(with: "0x") ? String(hex.dropFirst(2)) : hex

      var last = h.first
        return h.dropFirst().compactMap {
          guard
            let lastHexDigitValue = last?.hexDigitValue,
            let hexDigitValue = $0.hexDigitValue
          else {
            last = $0
            return nil
          }
      defer {
        last = nil
      }
        return UInt8(lastHexDigitValue * 16 + hexDigitValue)
      }
    }

    public func send(_ cmd: String) throws -> [UInt8] {
        dispatchPrecondition(condition: DispatchPredicate.notOnQueue(DispatchQueue.main))
        os_log("CardChannel: sending ==> \(cmd)")

        typealias APDUResult = (responseData: Data, sw1: UInt8, sw2: UInt8, error: Swift.Error?)

        var result: APDUResult! = nil

        guard let apdu = try? NFCISO7816APDU(data: Data(hexStringToBytes(cmd))) else {
            throw Error.invalidAPDU
        }

        let semaphore = DispatchSemaphore(value: 0)
        tag.sendCommand(apdu: apdu) {
            result = ($0, $1, $2, $3)
            semaphore.signal()
        }
        semaphore.wait()

        if let error = result.error {
            os_log("CardChannel: error: %@", error.localizedDescription)
            throw error
        }

        var responseData = Data()
        var responseDataArray = [UInt8](repeating: 0, count: result.responseData.count)

        for i in 0..<responseDataArray.count {
          responseDataArray[i] = result.responseData[i]
        }

        responseData.append(contentsOf: responseDataArray)
        responseData.append(result.sw1)
        responseData.append(result.sw2)

        return [UInt8](responseData)
    }

}
