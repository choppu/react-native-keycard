/* eslint-disable prettier/prettier */
import React from 'react';
import { View } from 'react-native';
import RNKeycard from 'react-native-keycard';
import { KeycardManager, PAIRED } from 'keycard-sdk/dist/keycard-manager';
import { LocalPairingStorage } from '../../src/LocalPairingStorage';
import NFCModal from './NFCModal';
import Styles from './Styles';
import type { Commandset } from 'keycard-sdk/dist/commandset';
import { Constants } from 'keycard-sdk/dist/constants';
import HomeScreen from './components/screens/Home';
import ChangePINScreen from './components/screens/ChangePIN';

const kManager = new KeycardManager(new LocalPairingStorage());
const authCert = new Uint8Array([0x02, 0x9a, 0xb9, 0x9e, 0xe1, 0xe7, 0xa7, 0x1b, 0xdf, 0x45, 0xb3, 0xf9, 0xc5, 0x8c, 0x99, 0x86, 0x6f, 0xf1, 0x29, 0x4d, 0x2c, 0x1e, 0x30, 0x4e, 0x22, 0x8a, 0x86, 0xe1, 0x0c, 0x33, 0x43, 0x50, 0x1c]);
export enum Screen {
  Home,
  Initialization,
  CreateMnemonic,
  LoadMnemonic,
  ChangeWallet,
  ShowWallet,
  RemoveKey,
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
  const screenRef = React.useRef(screen);
  const pinRef = React.useRef('');
  const newPinRef = React.useRef('');

  const startNFC = React.useCallback(async() : Promise<void> =>  {
    if (await RNKeycard.Core.isNFCSupported() && !await RNKeycard.Core.isNFCEnabled()) {
      await RNKeycard.Core.openNFCSettings();
    }

    await RNKeycard.Core.startNFC("Tap your Keycard");
    setIsModalVisible(true);
  }, []);

  const stopNFC = async () => {
    await RNKeycard.Core.stopNFC();
    setModalHeader('Ready to Scan');
    setModalPrompt('Hold your Keycard near NFC sensor');
    setIsModalVisible(false);
  }

  const handlePINChange = React.useCallback(async (p: string, newP: string) => {
    pinRef.current = p;
    newPinRef.current = newP;
    startNFC();
  }, [startNFC]);

  const handleCardConnected = React.useCallback(async(): Promise<void> => {
    const channel = new RNKeycard.NFCCardChannel();
    setModalHeader('Scanning...');
    setModalPrompt('Connected. Don’t move your card.');
    switch(screenRef.current) {
      case Screen.ChangePIN:
        await kManager.runOnSecureChannel(
        channel,
        PAIRED,
        { pin: pinRef.current, newPin: newPinRef.current, skipVerificationUID: [], cardPublicKeys: [authCert] },
        async (cmdSet: Commandset) => (await cmdSet.changePIN(newPinRef.current)).checkOK().data
        );

      setLogMessage(
        [...log,
          `${new Date(Date.now()).toLocaleString("en-GB")} - Pin updated successfully`
        ]
      )
      setScreen(Screen.Home);
    }
    await stopNFC();
  }, []);

  const handleCardInitialized = () => {}
  const handleCardAuthentic = () => {}
  const handleCardPaired = () => {}
  const handleSecureChannelOpened = () => {}
  const handlePinVerified = () => {}
  const handleCmdExecuted = () => {}


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
      {screen == Screen.ChangePIN && <ChangePINScreen onSubmitFunc={handlePINChange} onCancelFunc={setScreen}/>}

      <NFCModal isVisible={isModalVisible} modalHeader={modalHeader} modalPrompt={modalPrompt} onChangeFunc={stopNFC} />
    </View>
  );
}
