import Crypto from 'react-native-quick-crypto';
import { keccak_256 } from "@noble/hashes/sha3.js";
import * as secp256 from '@noble/secp256k1';



export namespace Utils {
  export const pairingPasswordToSecret = (pairingPassword: string) : Uint8Array  => {
    let salt = "Keycard Pairing Password Salt";
    let iterationCount = 50000;
    let kSize = 32;

    return Crypto.pbkdf2Sync(pairingPassword, salt, iterationCount, kSize, 'SHA256');
  }

  export function hx(arr: Uint8Array): string {
    let result = "";
    for (const value of arr) {
      result += value.toString(16).padStart(2, "0");
    }

    return result;
  }

  export function compressedPKeyToEthereumAddress(compressedPubKey: Uint8Array): string {
  const pubKey = secp256.Point.fromBytes(compressedPubKey).toBytes(false);
  return hx(keccak_256(pubKey.subarray(1)).subarray(12));
}
}
