import Crypto from 'react-native-quick-crypto';

export namespace Utils {
  export const pairingPasswordToSecret = (pairingPassword: string) : Uint8Array  => {
    let salt = "Keycard Pairing Password Salt";
    let iterationCount = 50000;
    let kSize = 32;

    return Crypto.pbkdf2Sync(pairingPassword, salt, iterationCount, kSize, 'SHA256');
  }
}
