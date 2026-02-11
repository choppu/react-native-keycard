import Keycard from './NativeKeycard';
import { NFCCardChannel } from './card-channel';
import Smartcard from './smartcard';

export const RNKeycard = {
  Core: Keycard,
  NFCCardChannel: NFCCardChannel,
  Smartcard: Smartcard,
};

export type {
  KeycardInitParams,
  KeyData,
  ApplicationInfo,
  GetKeysData,
  VerifyCardData,
  PairingData,
} from './NativeKeycard';
export default RNKeycard;
