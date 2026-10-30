import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { WhitelistedPubKeysStorage } from 'keycard-sdk';

const KEY = 'whitelisted_pub_keys';

export class LocalWhitelistedPubKeysStorage implements WhitelistedPubKeysStorage {
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

  private unhx(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  private load(): Uint8Array[] {
    const raw = this.storage.getString(KEY);
    if (!raw) {
      return [];
    }
    return raw.split(',').filter((hex) => hex.length > 0).map((hex) => this.unhx(hex));
  }

  private save(keys: Uint8Array[]): void {
    this.storage.set(KEY, keys.map((k) => this.hx(k)).join(','));
  }

  async addPubKeyToWhitelisted(cardPubKey: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const keys = this.load();
        const hex = this.hx(cardPubKey);
        if (!keys.some((k) => this.hx(k) === hex)) {
          keys.push(cardPubKey);
        }
        this.save(keys);
        resolve();
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async getWhitelistedPubKeys(): Promise<Uint8Array[]> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.load());
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async deleteWhitelistedPubKey(cardPubKey: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const hex = this.hx(cardPubKey);
        this.save(this.load().filter((k) => this.hx(k) !== hex));
        resolve();
      } catch (err: any) {
        reject(err);
      }
    });
  }
}
