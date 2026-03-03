import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { PairingStorage } from 'keycard-sdk';

export class LocalPairingStorage implements PairingStorage {
  storage: MMKV;

  constructor(encryptionKey?: string) {
    let key = encryptionKey ? encryptionKey : undefined;
    this.storage = createMMKV({ id: 'mmkv.default', encryptionKey: key });
  }

  private hx(arr: Uint8Array): string {
    return Array.from(arr)
      .map((i) => i.toString(16).padStart(2, '0'))
      .join('');
  }

  async putPairing(instanceUID: Uint8Array, pairing: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.storage.set(this.hx(instanceUID), pairing);
        resolve();
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async getPairing(instanceUID: Uint8Array): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        const pairing = this.storage.getString(this.hx(instanceUID));

        if (!pairing) {
          resolve(null);
        } else {
          resolve(pairing);
        }
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async deletePairing(instanceUID: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.storage.remove(this.hx(instanceUID));
        resolve();
      } catch (err: any) {
        reject(err);
      }
    });
  }
}
