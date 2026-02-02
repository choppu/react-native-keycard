import {
  TurboModuleRegistry,
  type CodegenTypes,
  type TurboModule,
} from 'react-native';
export interface Spec extends TurboModule {
  isNFCSupported(): Promise<boolean>;
  isNFCEnabled(): Promise<boolean>;
  startNFC(): Promise<boolean>;
  stopNFC(): Promise<boolean>;
  openNFCSettings(): Promise<boolean>;
  send(apdu: string): Promise<APDUData>;
  isKeycardConnected(): boolean;

  readonly onKeycardConnected: CodegenTypes.EventEmitter<void>;
  readonly onKeycardDisconnected: CodegenTypes.EventEmitter<void>;
  readonly onKeycardNFCEnabled: CodegenTypes.EventEmitter<void>;
  readonly onKeycardNFCDisabled: CodegenTypes.EventEmitter<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Keycard');

export type APDUData = {
  data: string;
  state: string;
};

export type KeycardInitParams = {
  pin: string;
  puk: string;
  password: string;
};

export type KeyData = {
  address: string;
  publicKey: string;
  walletRootAddress: string;
  walletRootPublicKey: string;
  encryptionPublicKey: string;
  keyUID: string;
  instanceUID: string;
  walletRootChainCode?: string;
  walletAddress?: string;
  walletPublicKey?: string;
};

export type ApplicationInfo = {
  isCardInitialized: boolean;
  cardName: string;
  isCardAuthentic: boolean;
  isCardPaired: boolean;
  pinRetryCounter?: number;
  pukRetryCounter?: number;
  hasMasterKey: boolean;
  instanceUID: string;
  keyUID: string;
  secureChannelPubKey: string;
  appVersion: string;
  freePairingSlots: number;
};

export type GetKeysData = {
  keyUID: string;
  instanceUID: string;
  encryptionPublicKey: string;
};

export type VerifyCardData = {
  caPublicKey: string;
  tlvData: string;
};

export type PairingData = {
  pairing: string;
  instanceUID: string;
};
