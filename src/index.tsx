import Keycard, { type Spec } from './NativeKeycard';
import { NFCCardChannel } from './CardChannel';
import { LocalPairingStorage } from './LocalPairingStorage';

// a TurboModule call must carry every argument, optional ones included
const Core: Spec = Object.create(Keycard, {
  stopNFC: {
    value: (message?: string, isError?: boolean) =>
      Keycard.stopNFC(message, isError),
  },
});

export const RNKeycard = {
  Core: Core,
  NFCCardChannel: NFCCardChannel,
  PairingStorage: LocalPairingStorage,
};

export default RNKeycard;
