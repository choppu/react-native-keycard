import Core from './Core';
import { NFCCardChannel } from './CardChannel';
import { LocalPairingStorage } from './LocalPairingStorage';

export const RNKeycard = {
  Core,
  NFCCardChannel: NFCCardChannel,
  PairingStorage: LocalPairingStorage,
};

export default RNKeycard;
