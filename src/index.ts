import Core from './Core';
import { NFCCardChannel } from './CardChannel';
import { CardLostError } from './CardLostError';
import { LocalPairingStorage } from './LocalPairingStorage';
import { LocalWhitelistedPubKeysStorage } from './LocalWhitelistedPubKeysStorage';
import type { Spec } from './NativeKeycard';

export type { Spec };

export const RNKeycard = {
  Core,
  NFCCardChannel: NFCCardChannel,
  CardLostError: CardLostError,
  PairingStorage: LocalPairingStorage,
  WhitelistedPubKeysStorage: LocalWhitelistedPubKeysStorage,
};

export default RNKeycard;
