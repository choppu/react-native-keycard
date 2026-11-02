import Crypto from 'react-native-quick-crypto';
import { bytesToHex } from '../../src/utils';

export namespace Utils {
  export const pairingPasswordToSecret = (pairingPassword: string): Uint8Array => {
    let salt = "Keycard Pairing Password Salt";
    let iterationCount = 50000;
    let kSize = 32;

    return Crypto.pbkdf2Sync(pairingPassword, salt, iterationCount, kSize, 'SHA256');
  }

  export function hx(arr?: Uint8Array): string {
    return bytesToHex(arr ?? new Uint8Array());
  }
}
