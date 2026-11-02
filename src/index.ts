import Core from './Core';
import { NFCCardChannel } from './CardChannel';
import { LocalPairingStorage } from './LocalPairingStorage';
import { LocalWhitelistedPubKeysStorage } from './LocalWhitelistedPubKeysStorage';
import type { Spec } from './NativeKeycard';

export type { Spec };

export const RNKeycard = {
  Core,
  NFCCardChannel: NFCCardChannel,
  PairingStorage: LocalPairingStorage,
  WhitelistedPubKeysStorage: LocalWhitelistedPubKeysStorage,
};

export default RNKeycard;
