import {
  TurboModuleRegistry,
  type CodegenTypes,
  type TurboModule,
} from 'react-native';
export interface Spec extends TurboModule {
  isNFCSupported(): Promise<boolean>;
  isNFCEnabled(): Promise<boolean>;
  startNFC(prompt: string): Promise<boolean>;
  stopNFC(): Promise<boolean>;
  stopNFCWithError(err: string): Promise<boolean>;
  stopNFCWithMessage(message: string): Promise<boolean>;
  setNFCMessage(message: string): Promise<void>;
  openNFCSettings(): Promise<boolean>;
  send(apdu: string): Promise<APDUData>;
  isKeycardConnected(): boolean;

  readonly onKeycardConnected: CodegenTypes.EventEmitter<void>;
  readonly onKeycardDisconnected: CodegenTypes.EventEmitter<void>;
  readonly onKeycardNFCEnabled: CodegenTypes.EventEmitter<void>;
  readonly onKeycardNFCDisabled: CodegenTypes.EventEmitter<void>;
  readonly onNFCUserCancelled: CodegenTypes.EventEmitter<void>;
  readonly onNFCTimeout: CodegenTypes.EventEmitter<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Keycard');

export type APDUData = {
  data: string;
  state: string;
};
