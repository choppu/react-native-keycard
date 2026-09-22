import Keycard, { type Spec } from './NativeKeycard';

// A TurboModule call must carry every argument, optional ones included.
// When called with no arguments, the generated bridge may omit the trailing
// optional params, so we always forward both explicitly.
const Core: Spec = Object.create(Keycard, {
  stopNFC: {
    value: (message?: string, isError?: boolean) =>
      Keycard.stopNFC(message, isError),
  },
});

export default Core;
