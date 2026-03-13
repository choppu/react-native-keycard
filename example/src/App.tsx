/* eslint-disable prettier/prettier */
import React from 'react';
import { View } from 'react-native';
import RNKeycard from 'react-native-keycard';
import { CardInitializeError, CardLoadKeyError, CardPairingError, CardPinVerificationError, KeycardManager, PAIRED } from 'keycard-sdk/dist/keycard-manager';
import { LocalPairingStorage } from '../../src/LocalPairingStorage';
import NFCModal from './NFCModal';
import Styles from './Styles';
import type { Commandset } from 'keycard-sdk/dist/commandset';
import HomeScreen from './components/screens/Home';
import ChangePINScreen from './components/screens/ChangePIN';
import type { NFCCardChannel } from '../../src/CardChannel';
import useNFCSession from './hooks/useNFC';
import type { KeycardManagerArgs, KeycardManagerResponse, KeycardManagerResponseData } from 'keycard-sdk/dist/types/keycard-manager-types';
import ChangePUKScreen from './components/screens/ChangePUK';
import InitializationScreen from './components/screens/Initialization';

const kManager = new KeycardManager(new LocalPairingStorage());
const authCert = new Uint8Array([0x02, 0x9a, 0xb9, 0x9e, 0xe1, 0xe7, 0xa7, 0x1b, 0xdf, 0x45, 0xb3, 0xf9, 0xc5, 0x8c, 0x99, 0x86, 0x6f, 0xf1, 0x29, 0x4d, 0x2c, 0x1e, 0x30, 0x4e, 0x22, 0x8a, 0x86, 0xe1, 0x0c, 0x33, 0x43, 0x50, 0x1c]);
export enum Screen {
  Home,
  Initialization,
  Pairing,
  HandleKey,
  CreateMnemonic,
  LoadMnemonic,
  ChangeWallet,
  ShowWallet,
  RemoveKey,
  VerifyPIN,
  ChangePIN,
  ChangePUK,
  ChangePairing,
  Unpair,
  UnpairOthers
}

export default function App() {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [modalHeader, setModalHeader] = React.useState<string>('Ready to Scan');
  const [modalPrompt, setModalPrompt] = React.useState<string>('Hold your Keycard near NFC sensor');
  const [screen, setScreen] = React.useState<number>(Screen.Home);
  const [log, setLogMessage] = React.useState<string[]>([]);
  const screenRef = React.useRef<number>(screen);
  const pinRef = React.useRef<string | undefined>(undefined);
  const newPinRef = React.useRef<string | undefined>(undefined);
  const newPukRef = React.useRef<string | undefined>(undefined);
  const cardPublicKeysRef = React.useRef<Uint8Array[]>([authCert]);
  const pairingPasswordRef = React.useRef<Uint8Array | undefined>(undefined);
  const cbFuncRef = React.useRef<null | ((newArgs: KeycardManagerArgs) => void)>(null);
  const { start, stop } = useNFCSession(setIsModalVisible);

  const checkCmdExec = (responseData: KeycardManagerResponse, cmd: (newArgs: KeycardManagerArgs) => void, successMessage: string) => {
    stop();

    if (responseData.status == 'error') {
      const d = responseData.data as KeycardManagerResponseData;
      cbFuncRef.current = cmd;

      switch (d.type) {
        case CardInitializeError:
          setScreen(Screen.Initialization);
          break;
        case CardPairingError:
          setScreen(Screen.Pairing);
          break;
        case CardPinVerificationError:
          setScreen(Screen.VerifyPIN);
          break;
        case CardLoadKeyError:
          setScreen(Screen.HandleKey);
          break;
        default:
          setScreen(Screen.Home);
          setLogMessage([
            ...log,
            `${new Date(Date.now()).toLocaleString("en-GB")} - ${d.message}`
          ]);
      }
    } else {
      setLogMessage(
        [...log,
          successMessage
        ]
      )
      setScreen(Screen.Home);
    }
  }

  const handlePINChange = React.useCallback((p: string, newP: string) => {
    pinRef.current = p;
    newPinRef.current = newP;
    start();
  }, [start]);

  const handlePUKChange = React.useCallback((p: string, newPk: string) => {
    pinRef.current = p;
    newPukRef.current = newPk;
    start();
  }, [start]);

  const changePIN = React.useCallback(async (channel: NFCCardChannel, args: KeycardManagerArgs) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      args,
      async (cmdSet: Commandset) => (await cmdSet.changePIN(args.newPin!)).checkOK().data
    );
  }, []);

  const changePUK = React.useCallback(async (channel: NFCCardChannel, args: KeycardManagerArgs) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      args,
      async (cmdSet: Commandset) => (await cmdSet.changePUK(args.newPuk!)).checkOK().data
    );
  }, []);

  const handleCardConnected = React.useCallback(async (): Promise<void> => {
    const channel = new RNKeycard.NFCCardChannel();
    const args = {
      pin: pinRef.current,
      newPin: newPinRef.current,
      newPuk: newPukRef.current,
      cardPublicKeys: cardPublicKeysRef.current,
      pairingPasswordRef: pairingPasswordRef.current,

    }
    setModalHeader('Scanning...');
    setModalPrompt('Connected. Don’t move your card.');
    switch (screenRef.current) {
      case Screen.ChangePIN:
        checkCmdExec(
          await changePIN(channel, args),
          (newArgs: KeycardManagerArgs) => changePIN(channel, newArgs),
          `${new Date(Date.now()).toLocaleString("en-GB")} - Pin updated successfully`
        );
        break;
      case Screen.ChangePUK:
        checkCmdExec(
          await changePUK(channel, args),
          (newArgs: KeycardManagerArgs) => changePUK(channel, newArgs),
          `${new Date(Date.now()).toLocaleString("en-GB")} - Puk updated successfully`
        );
        break;
      default:
        break;
      }
    stop();
  }, [stop, pinRef, newPinRef, cardPublicKeysRef, pairingPasswordRef]);

  const handleCardInitialized = () => { }
  const handleCardAuthentic = () => { }
  const handleCardPaired = () => { }
  const handleSecureChannelOpened = () => { }
  const handlePinVerified = () => { }
  const handleCmdExecuted = () => { }


  React.useEffect(() => {
    screenRef.current = screen;
    const onConnect = RNKeycard.Core.onKeycardConnected(handleCardConnected);
    const onCardInitialized = kManager.emitter.subscribe("card-initialized", handleCardInitialized);
    const onCardAuthentic = kManager.emitter.subscribe("card-authentic", handleCardAuthentic);
    const onCardPaired = kManager.emitter.subscribe("card-paired", handleCardPaired);
    const onSecureChannelOpened = kManager.emitter.subscribe("secure-channel-opened", handleSecureChannelOpened)
    const onPinVerified = kManager.emitter.subscribe("card-pin-verified", handlePinVerified);
    const onCmdSuccess = kManager.emitter.subscribe("cmd-executed", handleCmdExecuted);

    return () => {
      onConnect.remove();
      onCardInitialized.unsubscribe();
      onCardAuthentic.unsubscribe();
      onCardPaired.unsubscribe();
      onSecureChannelOpened.unsubscribe();
      onPinVerified.unsubscribe();
      onCmdSuccess.unsubscribe();
    };
  }, [screen, log]);

  return (
    <View style={Styles.mainContainer}>
      {screen == Screen.Home && <HomeScreen logs={log} onClickFunc={setScreen} />}
      {screen == Screen.ChangePIN && <InitializationScreen onSubmitFunc={() => handlePINChange} onCancelFunc={setScreen} />}
      {screen == Screen.ChangePUK && <ChangePUKScreen onSubmitFunc={handlePUKChange} onCancelFunc={setScreen} />}

      <NFCModal isVisible={isModalVisible} modalHeader={modalHeader} modalPrompt={modalPrompt} onChangeFunc={stop} />
    </View>
  );
}
