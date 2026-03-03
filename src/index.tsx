import Keycard from './NativeKeycard';
import { NFCCardChannel } from './CardChannel';
import { LocalPairingStorage } from './LocalPairingStorage';

export const RNKeycard = {
  Core: Keycard,
  NFCCardChannel: NFCCardChannel,
  PairingStorage: LocalPairingStorage,
};

export default RNKeycard;
