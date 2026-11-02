import type { PairingStorage } from 'keycard-sdk';
import { bytesToHex } from './utils';
import { LocalMMKVStorage } from './LocalMMKVStorage';

export class LocalPairingStorage extends LocalMMKVStorage implements PairingStorage {
  async putPairing(instanceUID: Uint8Array, pairing: string): Promise<void> {
    this.storage.set(bytesToHex(instanceUID), pairing);
  }

  async getPairing(instanceUID: Uint8Array): Promise<string | null> {
    return this.storage.getString(bytesToHex(instanceUID)) ?? null;
  }

  async deletePairing(instanceUID: Uint8Array): Promise<void> {
    this.storage.remove(bytesToHex(instanceUID));
  }
}
