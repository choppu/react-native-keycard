import Keycard, { type Spec } from './NativeKeycard';

// forward both args explicitly: the bridge may drop trailing optional params when called with none
const Core: Spec = Object.create(Keycard, {
  stopNFC: {
    value: (message?: string, isError?: boolean) =>
      Keycard.stopNFC(message, isError),
  },
});

export default Core;
