/* eslint-disable prettier/prettier */
import React from 'react';
import { View } from 'react-native';
import RNKeycard from 'react-native-keycard';
import { CardInitializeError, CardLoadKeyError, CardPairingError, CardPinVerificationError, defaultPairingPassword, KeycardManager, KManagerError, PAIRED } from 'keycard-sdk/dist/keycard-manager';
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
import VerifyPINScreen from './components/screens/VerifyPIN';
import PairingScreen from './components/screens/Pairing';
import { Utils } from './utils';
import UnpairScreen from './components/screens/Unpair';
import ChangePairingScreen from './components/screens/ChangePairing';

const kManager = new KeycardManager(new LocalPairingStorage());
const authCert = new Uint8Array([0x02, 0x9a, 0xb9, 0x9e, 0xe1, 0xe7, 0xa7, 0x1b, 0xdf, 0x45, 0xb3, 0xf9, 0xc5, 0x8c, 0x99, 0x86, 0x6f, 0xf1, 0x29, 0x4d, 0x2c, 0x1e, 0x30, 0x4e, 0x22, 0x8a, 0x86, 0xe1, 0x0c, 0x33, 0x43, 0x50, 0x1c]);
const initialArgs = {cardPublicKeys: [authCert], skipVerificationUID: []};
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

export enum Phase {
  Idle,
  CardInitialization,
  CardPairing,
  CardPinVerification,
  CardLoadKey,
  CardCmdExecution
}

export default function App() {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [modalHeader, setModalHeader] = React.useState<string>('Ready to Scan');
  const [modalPrompt, setModalPrompt] = React.useState<string>('Hold your Keycard near NFC sensor');
  const [screen, setScreen] = React.useState<number>(Screen.Home);
  const [phase, setPhase] = React.useState<number>(Phase.Idle);
  const [pinRetry, setPinRetry] = React.useState<number>(3);
  const [log, setLogMessage] = React.useState<string[]>([]);
  const [kmArgs, setKMArgs] = React.useState<KeycardManagerArgs>(initialArgs);
  const [cmdExecFailed, setCmdExecFailed] = React.useState<boolean>(false)
  const screenRef = React.useRef<number>(screen);
  const pinRef = React.useRef<string | undefined>(undefined);
  const newPinRef = React.useRef<string | undefined>(undefined);
  const newPairingPasswordRef = React.useRef<Uint8Array | undefined>(undefined);
  const newPukRef = React.useRef<string | undefined>(undefined);
  const pairingPasswordRef = React.useRef<Uint8Array | undefined>(undefined);
  const { start, stop } = useNFCSession(setIsModalVisible);

  const checkCmdExec = (responseData: KeycardManagerResponse, successMessage: string) => {
    stop();

    if (responseData.status == 'error') {
      const d = responseData.data as KeycardManagerResponseData;
      setCmdExecFailed(true);
      switch (d.type) {
        case CardInitializeError:
          setPhase(Phase.CardInitialization);
          break;
        case CardPairingError:
          setPhase(Phase.CardPairing);
          break;
        case CardPinVerificationError:
          setPhase(Phase.CardPinVerification);
          break;
        case CardLoadKeyError:
          setPhase(Phase.CardLoadKey);
          break;
        default:
          setPhase(Phase.Idle);
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
      setKMArgs(initialArgs);
      setPhase(Phase.Idle);
      setScreen(Screen.Home);
      setCmdExecFailed(false);
      setPinRetry(3);
      setModalHeader('Ready to Scan');
      setModalPrompt('Hold your Keycard near NFC sensor');
      pinRef.current = undefined;
      pairingPasswordRef.current = undefined;
      newPinRef.current = undefined;
      newPukRef.current = undefined;
      newPairingPasswordRef.current = undefined;
    }
  }

  const handleVerifyPin = React.useCallback((p: string) => {
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    setCmdExecFailed(false);
    start();
    return true;
  }, [start, kmArgs]);

  const handlePairing = React.useCallback((pass: string) => {
    pairingPasswordRef.current = Utils.pairingPasswordToSecret(pass);
    setKMArgs(prevArgs => ({...prevArgs, pairingPassword: pairingPasswordRef.current}));
    setCmdExecFailed(false);
    start();
    return true;
  }, [start, kmArgs]);

  const handlePINChange = React.useCallback((p: string, newP: string) => {
    pinRef.current = p;
    newPinRef.current = newP;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handlePUKChange = React.useCallback((p: string, newPk: string) => {
    pinRef.current = p;
    newPukRef.current = newPk;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handlePairingChange = React.useCallback((p: string, pass?: string) => {
    pinRef.current = p;
    newPairingPasswordRef.current = pass ? Utils.pairingPasswordToSecret(pass) : defaultPairingPassword;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handleUnpair = React.useCallback((p: string) => {
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const changePIN = React.useCallback(async (channel: NFCCardChannel) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePIN(newPinRef.current!)).checkOK().data
    );
  }, [kManager, kmArgs]);

  const changePUK = React.useCallback(async (channel: NFCCardChannel) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePUK(newPukRef.current!)).checkOK().data
    );
  }, [kManager, kmArgs]);

  const changePairing = React.useCallback(async (channel: NFCCardChannel) => {
    console.log(kmArgs);
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePairingPassword(newPairingPasswordRef.current!)).checkOK().data
    );
  }, [kManager, kmArgs]);

  const unpair = React.useCallback(async (channel: NFCCardChannel) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      kmArgs,
      async (cmdSet: Commandset) => {
        const uid = cmdSet.applicationInfo?.instanceUID;
        await cmdSet.autoUnpair();
        if(uid) {
          kManager.pairingStorage.deletePairing(uid);
        }
      }
    );
  }, [kManager, kmArgs]);

  const unpairOthers = React.useCallback(async (channel: NFCCardChannel) => {
    return await kManager.runOnSecureChannel(
      channel,
      PAIRED,
      kmArgs,
      async (cmdSet: Commandset) => {
        await cmdSet.unpairOthers();
      }
    );
  }, [kManager, kmArgs]);

  const handleCardConnected = React.useCallback(async (): Promise<void> => {
    try {
      const channel = new RNKeycard.NFCCardChannel();
      setModalHeader('Scanning...');
      setModalPrompt('Connected. Don’t move your card.');
      switch (screenRef.current) {
        case Screen.ChangePIN:
          checkCmdExec(
            await changePIN(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Pin updated successfully`
          );
          break;
        case Screen.ChangePUK:
          checkCmdExec(
            await changePUK(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Puk updated successfully`
          );
          break;
        case Screen.ChangePairing:
          checkCmdExec(
            await changePairing(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Pairing password updated successfully`
          );
          break;
        case Screen.Unpair:
          checkCmdExec(
            await unpair(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Card unpaired successfully`
          );
          break;
        case Screen.UnpairOthers:
          checkCmdExec(
            await unpairOthers(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Card unpaired from other devices successfully`
          );
          break;
        default:
          break;
      }
    } catch (err: any) {
      console.log(err);
      setModalHeader('Error');
      setModalPrompt(err.message);

      if(err instanceof KManagerError) {
        setCmdExecFailed(true);
        const data = err.cardData as KeycardManagerResponseData;
        if(data.cardInfo && !data.cardInfo.initializedCard) {
          setPhase(Phase.CardInitialization);
        } else if(!data.paired || !data.pinRetry) {
          if(data.cardAuthentic != undefined && data.cardAuthentic == false) {
            setPhase(Phase.Idle);
            setScreen(Screen.Home);
            setCmdExecFailed(false);
          } else {
            setPhase(Phase.CardPairing);
          }
        } else if(data.pinRetry) {
          setPhase(Phase.CardPinVerification);
          setPinRetry(err.cardData.pinRetry ? err.cardData.pinRetry: 3);
        } else {
          setPhase(Phase.Idle);
          setScreen(Screen.Home);
          setCmdExecFailed(false);
        }
      } else {
        setScreen(Screen.Home);
      }
      setLogMessage([
        ...log,
        `${new Date(Date.now()).toLocaleString("en-GB")} - ${err.message}`
      ]);
      stop();
      setModalHeader('Ready to Scan');
      setModalPrompt('Hold your Keycard near NFC sensor');
    }
  }, [stop, changePIN, changePUK, phase, log, screen]);

  const handleCardInitialized = React.useCallback(() => setPhase(Phase.CardPairing), [phase]);
  const handleCardAuthentic = React.useCallback(() => setPhase(Phase.CardPairing), [phase]);
  const handleCardPaired = React.useCallback(() => setPhase(Phase.CardPairing), [phase]);
  const handleSecureChannelOpened = React.useCallback(() => setPhase(Phase.CardPinVerification), [phase]);
  const handlePinVerified = React.useCallback(() => setPhase(Phase.CardCmdExecution), [phase]);
  const handleCmdExecuted = React.useCallback(() => setPhase(Phase.Idle), [phase]);


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
  }, [screen, log, phase, handleCardConnected, handleCardInitialized, handleCardAuthentic, handleCardPaired, handleSecureChannelOpened, handlePinVerified, handleCmdExecuted]);

  return (
    <View style={Styles.mainContainer}>
      {(cmdExecFailed == false) && screen == Screen.Home && <HomeScreen logs={log} onClickFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePIN && <ChangePINScreen onSubmitFunc={handlePINChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePUK && <ChangePUKScreen onSubmitFunc={handlePUKChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePairing && <ChangePairingScreen onSubmitFunc={handlePairingChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.Unpair && <UnpairScreen onSubmitFunc={handleUnpair} onCancelFunc={setScreen} prompt={'Are you sure you want to unpair your card?'}/>}
      {(cmdExecFailed == false) && screen == Screen.UnpairOthers && <UnpairScreen onSubmitFunc={handleUnpair} onCancelFunc={setScreen} prompt={'Are you sure you want to unpair your card from other devices?'}/>}

      {phase == Phase.CardInitialization && cmdExecFailed && <InitializationScreen onSubmitFunc={() => {}} onCancelFunc={setScreen}/>}
      {phase == Phase.CardPairing && cmdExecFailed && <PairingScreen onSubmitFunc={handlePairing} onCancelFunc={setScreen} />}
      {phase == Phase.CardPinVerification && cmdExecFailed && <VerifyPINScreen onSubmitFunc={handleVerifyPin} onCancelFunc={setScreen} pinRetry={pinRetry}/>}
      <NFCModal isVisible={isModalVisible} modalHeader={modalHeader} modalPrompt={modalPrompt} onChangeFunc={stop} />
    </View>
  );
}
