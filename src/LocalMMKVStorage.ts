import { createMMKV, type MMKV } from 'react-native-mmkv';

export abstract class LocalMMKVStorage {
  protected storage: MMKV;

  constructor(encryptionKey?: string) {
    this.storage = createMMKV({ id: 'mmkv.default', encryptionKey });
  }
}
