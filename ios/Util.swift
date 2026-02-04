import Foundation

public class Util : NSObject {
    static let shared = Util()

    override private init() {}

    public func dropZeroPrefix(uint8: [UInt8]) -> [UInt8] {
        uint8[0] == 0x00 ? Array(uint8[1...]) : uint8
    }

    public func bytesToHex(_ bytes: [UInt8]) -> String {
        return bytes.map { String(format: "%02hhx", $0) }.joined()
    }

    public func hexStringToBytes(_ hex: String) -> [UInt8] {
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
}
