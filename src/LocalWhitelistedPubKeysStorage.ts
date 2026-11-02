import type { WhitelistedPubKeysStorage } from 'keycard-sdk';
import { bytesToHex, hexToBytes } from './utils';
import { LocalMMKVStorage } from './LocalMMKVStorage';

const KEY = 'whitelisted_pub_keys';

export class LocalWhitelistedPubKeysStorage extends LocalMMKVStorage implements WhitelistedPubKeysStorage {
  private load(): string[] {
    return this.storage.getString(KEY)?.split(',').filter((hex) => hex.length > 0) ?? [];
  }

  private save(keys: string[]): void {
    this.storage.set(KEY, keys.join(','));
  }

  async addPubKeyToWhitelisted(cardPubKey: Uint8Array): Promise<void> {
    const hex = bytesToHex(cardPubKey);
    const keys = this.load();

    if (!keys.includes(hex)) {
      keys.push(hex);
    }
    this.save(keys);
  }

  async getWhitelistedPubKeys(): Promise<Uint8Array[]> {
    return this.load().map((hex) => hexToBytes(hex));
  }

  async deleteWhitelistedPubKey(cardPubKey: Uint8Array): Promise<void> {
    const hex = bytesToHex(cardPubKey);
    this.save(this.load().filter((key) => key !== hex));
  }
}
