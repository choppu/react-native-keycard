/* eslint-disable prettier/prettier */
import React from 'react';
import { View } from 'react-native';
import RNKeycard from 'react-native-keycard';
import { CardInitializeError, CardLoadKeyError, CardPairingError, CardPinVerificationError, defaultPairingPassword, KeycardManager, KManagerError, PAIRED } from 'keycard-sdk/dist/keycard-manager';
import { LocalPairingStorage } from '../../src/LocalPairingStorage';
import NFCModal from './NFCModal';
import Styles from './Styles';
import HomeScreen from './components/screens/Home';
import ChangePINScreen from './components/screens/ChangePIN';
import useNFCSession from './hooks/useNFC';
import type { KeycardManagerArgs, KeycardManagerResponse, KeycardManagerResponseData } from 'keycard-sdk/dist/types/keycard-manager-types';
import ChangePUKScreen from './components/screens/ChangePUK';
import InitializationScreen, { type initData } from './components/screens/Initialization';
import VerifyPINScreen from './components/screens/VerifyPIN';
import PairingScreen from './components/screens/Pairing';
import { Utils } from './utils';
import UnpairScreen from './components/screens/Unpair';
import ChangePairingScreen from './components/screens/ChangePairing';
import { ApplicationInfo } from 'keycard-sdk/dist/application-info';
import { ApplicationStatus } from 'keycard-sdk/dist/application-status';
import { KeyPath } from 'keycard-sdk/dist/key-path';
import CreateMnemonicScreen from './components/screens/CreateMnemonic';
import RemoveKeyScreen from './components/screens/RemoveKey';
import useKeycard from './hooks/useKeycard';
import LoadMnemonicScreen from './components/screens/LoadMnemonic';
import FactoryResetScreen from './components/screens/FactoryReset';
import type { NFCCardChannel } from '../../src/CardChannel';
import CardLoadKeyScreen from './components/screens/CardLoadKey';
import ShowWalletsScreen from './components/screens/ShowWallets';

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
  Sign,
  RemoveKey,
  VerifyPIN,
  ChangePIN,
  ChangePUK,
  ChangePairing,
  Unpair,
  UnpairOthers,
  FactoryReset
}

export enum Phase {
  Idle,
  CardInitialization,
  CardPairing,
  CardPinVerification,
  CardLoadKey,
  CardCmdExecution
}

export enum Tabs {
  Wallet,
  Settings,
  Card
}

export type CardInfo = {
  appInfo: ApplicationInfo;
  status: ApplicationStatus;
  path: KeyPath
}

export type Wallet = {
  index: number;
  address: string;
  publicKey: string;
}

export default function App() {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [modalHeader, setModalHeader] = React.useState<string>('Ready to Scan');
  const [modalPrompt, setModalPrompt] = React.useState<string>('Hold your Keycard near NFC sensor');
  const [screen, setScreen] = React.useState<number>(Screen.Home);
  const [startScreen, setStartScreen] = React.useState<number | undefined>(undefined);
  const [lastScreenState, setlastScreenState] = React.useState<number>(0);
  const [tab, setTab] = React.useState<number>(Tabs.Wallet);
  const [phase, setPhase] = React.useState<number>(Phase.Idle);
  const [pinRetry, setPinRetry] = React.useState<number>(1);
  const [log, setLogMessage] = React.useState<string[]>([]);
  const [cardInfo, setCardInfo] = React.useState<CardInfo>({} as CardInfo);
  const [kmArgs, setKMArgs] = React.useState<KeycardManagerArgs>(initialArgs);
  const [cmdExecFailed, setCmdExecFailed] = React.useState<boolean>(false);
  const [mnemonic, setMnemonic] = React.useState<string>('');
  const [ethAddresses, setEthAddresses] = React.useState<Wallet[]>([]);
  const screenRef = React.useRef<number>(screen);
  const pinRef = React.useRef<string | undefined>(undefined);
  const duressPinRef = React.useRef<string | undefined>(undefined);
  const newPinRef = React.useRef<string | undefined>(undefined);
  const newPairingPasswordRef = React.useRef<Uint8Array | undefined>(undefined);
  const newPukRef = React.useRef<string | undefined>(undefined);
  const pairingPasswordRef = React.useRef<Uint8Array | undefined>(undefined);
  const mnemonicLengthRef = React.useRef<number>(12);
  const mnemonicRef = React.useRef<string>('');
  const lastScreenRef = React.useRef<number>(undefined);
  const { start, stop } = useNFCSession(setIsModalVisible, setModalHeader, setModalPrompt);
  const {
    createMnemonic,
    loadMnemonic,
    exportKey,
    removeKey,
    changePIN,
    changePUK,
    changePairing,
    unpair,
    unpairOthers,
    getCardInfo,
    factoryReset
  } = useKeycard({
    kManager: kManager,
    kmArgs: kmArgs,
    pinRef: pinRef,
    duressPinRef: duressPinRef,
    newPinRef: newPinRef,
    newPukRef: newPukRef,
    mnemonicLengthRef: mnemonicLengthRef,
    mnemonicRef: mnemonicRef,
    cardInfo: cardInfo,
    setCardInfo: setCardInfo,
    setMnemonic: setMnemonic,
    setAddresses: setEthAddresses,
    newPairingPasswordRef: newPairingPasswordRef
  });


  const reset = React.useCallback(() => {
    setKMArgs(initialArgs);
    setPhase(Phase.Idle);
    setCmdExecFailed(false);
    setModalHeader('Ready to Scan');
    setModalPrompt('Hold your Keycard near NFC sensor');
    setPinRetry(1);
    pinRef.current = undefined;
    pairingPasswordRef.current = undefined;
    newPinRef.current = undefined;
    newPukRef.current = undefined;
    newPairingPasswordRef.current = undefined;
    duressPinRef.current = undefined;
  }, [kmArgs, phase, modalHeader, modalPrompt, pinRetry, cmdExecFailed]);

  const resetCard = React.useCallback(async(channel: NFCCardChannel) => {
    const factoryResetSuccess = await factoryReset(channel);
    const m = factoryResetSuccess ? 'Keycard has been reset. Initialize Keycard before using it again.' : 'Keycard is not initialized. Factory reset failed.'
    stop();
    reset();
    setLogMessage([
      ...log,
      `${new Date(Date.now()).toLocaleString("en-GB")} - ${m}`
    ]);
    setScreen(Screen.Home);
    setlastScreenState(0);
  }, [stop, reset, screen, log, factoryReset, lastScreenState])

  const handleCardError = React.useCallback((errorCode: number, errorMessage: string, pRetry: number) => {
    setCmdExecFailed(true);
    switch (errorCode) {
      case CardInitializeError:
        setPhase(Phase.CardInitialization);
        break;
      case CardPairingError:
        setPhase(Phase.CardPairing);
        break;
      case CardPinVerificationError:
        if(pRetry > 0) {
          setPhase(Phase.CardPinVerification);
          setPinRetry(pRetry);
        } else {
          setPhase(Phase.Idle);
          setScreen(Screen.FactoryReset);
          setCmdExecFailed(false);
        }
        break;
      case CardLoadKeyError:
        setPhase(Phase.CardLoadKey);
        break;
      default:
        setPhase(Phase.Idle);
        setScreen(Screen.Home);
        setCmdExecFailed(false);
        setLogMessage([
          ...log,
          `${new Date(Date.now()).toLocaleString("en-GB")} - ${errorMessage}`
        ]);
        break;
    }
  }, [log, screen, phase, cmdExecFailed, pinRetry]);

  const checkCmdExec = React.useCallback((responseData: KeycardManagerResponse, successMessage?: string) => {
    stop();

    if (responseData.status == 'error') {
      const d = responseData.data as KeycardManagerResponseData;
      handleCardError(d.type!, d.message!, pinRetry);
    } else {
      if(successMessage) {
        setLogMessage(
        [...log,
          successMessage
        ]
        )
      }

      reset();

      if((screen != Screen.CreateMnemonic) && (screen != Screen.ShowWallet)) {
        setScreen(Screen.Home);
      }

      if((lastScreenRef.current != undefined) && ((screen == Screen.CreateMnemonic && lastScreenState != 2) || screen == Screen.LoadMnemonic)) {
        setScreen(lastScreenRef.current!);
        setStartScreen(undefined);
        lastScreenRef.current = undefined;
      }
    }
  }, [screen, phase, log, pinRetry, reset]);

  const handleTabChange = React.useCallback((val: number) => {
    setCardInfo({} as CardInfo);
    setTab(val);
  }, [tab, cardInfo]);

  const handleVerifyPin = React.useCallback((p: string) => {
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    setCmdExecFailed(false);
    start();
    return true;
  }, [start, kmArgs]);

  const handleCardLoadKey = React.useCallback((kScreen: number) => {
    lastScreenRef.current = screen;
    setStartScreen(screen);
    setScreen(kScreen);
    setCmdExecFailed(false);
  }, [screen, cmdExecFailed]);

  const handlePairing = React.useCallback((pass: string) => {
    pairingPasswordRef.current = Utils.pairingPasswordToSecret(pass);
    setKMArgs(prevArgs => ({...prevArgs, pairingPassword: pairingPasswordRef.current}));
    setCmdExecFailed(false);
    start();
    return true;
  }, [start, kmArgs]);

  const handleInit = React.useCallback((pin: string, duressPin?: string, initData?: initData) => {
    pinRef.current = pin;

    if(duressPin) {
      duressPinRef.current = duressPin;
      setKMArgs(prevArgs => ({...prevArgs, duressPin: duressPinRef.current}));
    }

    if(initData) {
      newPukRef.current = initData.puk;
      newPairingPasswordRef.current = Utils.pairingPasswordToSecret(initData.pairingPassword);
      setKMArgs(prevArgs => ({...prevArgs, newPuk: newPukRef.current, newPairingPassword: newPairingPasswordRef.current}));
    }

    setKMArgs(prevArgs => ({...prevArgs, pin: pinRef.current}));
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

  const handleCreateMnemonic = React.useCallback((p: string, mLength: number, lastScreenState: number) => {
    mnemonicLengthRef.current = mLength;
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    setlastScreenState(lastScreenState);
    start();
  }, [start, kmArgs]);

  const handleShowWalletAddress = React.useCallback((p: string) => {
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handleLoadMnemonic = React.useCallback((p: string, mnemonic: string) => {
    pinRef.current = p;
    mnemonicRef.current = mnemonic;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handleRemoveKey = React.useCallback((p: string) => {
    pinRef.current = p;
    setKMArgs(prevArgs => ({...prevArgs, pin: p}));
    start();
  }, [start, kmArgs]);

  const handleVerificationCancelled = React.useCallback(() => {
    setScreen(Screen.Home);
    setCmdExecFailed(false);
  }, [screen]);

  const handleCardConnected = React.useCallback(async (): Promise<void> => {
    try {
      const channel = new RNKeycard.NFCCardChannel();
      setModalHeader('Scanning...');
      setModalPrompt('Connected. Don’t move your card.');
      switch (screenRef.current) {
        case Screen.Home:
          checkCmdExec(
            await getCardInfo(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Card application info retrieved successfully`
          );
          break;
        case Screen.CreateMnemonic:
          checkCmdExec(
            await createMnemonic(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Mnemonic created successfully`
          );
          break;
        case Screen.LoadMnemonic:
          checkCmdExec(
            await loadMnemonic(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Keypair added successfully`
          );
          break;
        case Screen.ShowWallet:
          checkCmdExec(
            await exportKey(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Extended public key exported successfully`
          );
          break;
        case Screen.RemoveKey:
          checkCmdExec(
            await removeKey(channel),
            `${new Date(Date.now()).toLocaleString("en-GB")} - Key removed successfully`
          );
          break;
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
        case Screen.FactoryReset:
          await resetCard(channel);
          break;
        default:
          setScreen(Screen.Home);
          break;
      }
    } catch (err: any) {
      setModalHeader('Error');
      setModalPrompt(err.message);

      if(err instanceof KManagerError) {
        const pRetry = (err.cardData.pinRetry != undefined) ? err.cardData.pinRetry : pinRetry;
        handleCardError(err.errorCode, err.message, pRetry);
      } else {
        setScreen(Screen.Home);
        setlastScreenState(0);
        setLogMessage([
          ...log,
          `${new Date(Date.now()).toLocaleString("en-GB")} - ${err.message}`
        ]);
      }
      stop();
    }
  }, [stop, createMnemonic, loadMnemonic, removeKey, changePIN, changePUK, getCardInfo, changePairing, unpair, unpairOthers, phase, log, screen, cardInfo]);

  const handleCardInitialized = React.useCallback(() => {
    setPhase(Phase.CardPairing);
    setLogMessage([
        ...log,
        `${new Date(Date.now()).toLocaleString("en-GB")} - Card initialized successfully`
      ]);
  }, [phase, log]);
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
  }, [screen, log, phase, kManager, handleCardConnected, handleCardInitialized, handleCardAuthentic, handleCardPaired, handleSecureChannelOpened, handlePinVerified, handleCmdExecuted]);

  return (
    <View style={Styles.mainContainer}>
      {(cmdExecFailed == false) && screen == Screen.Home && <HomeScreen logs={log} tab={tab} onTabChangeFunc={handleTabChange} cardInfo={cardInfo} onClickFunc={setScreen} onShowCardFunc={start}/>}
      {(cmdExecFailed == false) && screen == Screen.CreateMnemonic && <CreateMnemonicScreen onCancelFunc={setScreen} onSubmitFunc={handleCreateMnemonic} mnemonic={mnemonic} startScreen={startScreen} updateMnemonicFunc={setMnemonic} lastScreenState={lastScreenState} onShowMnemonicFunc={setlastScreenState}/>}
      {(cmdExecFailed == false) && screen == Screen.LoadMnemonic && <LoadMnemonicScreen onCancelFunc={setScreen} onSubmitFunc={handleLoadMnemonic} />}
      {(cmdExecFailed == false) && screen == Screen.ShowWallet && <ShowWalletsScreen addresses={ethAddresses} onCancelFunc={setScreen} onSubmitFunc={handleShowWalletAddress} onScreenCloseFunc={setEthAddresses}/>}
      {(cmdExecFailed == false) && screen == Screen.RemoveKey && <RemoveKeyScreen onCancelFunc={setScreen} onSubmitFunc={handleRemoveKey} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePIN && <ChangePINScreen onSubmitFunc={handlePINChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePUK && <ChangePUKScreen onSubmitFunc={handlePUKChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.ChangePairing && <ChangePairingScreen onSubmitFunc={handlePairingChange} onCancelFunc={setScreen} />}
      {(cmdExecFailed == false) && screen == Screen.Unpair && <UnpairScreen onSubmitFunc={handleUnpair} onCancelFunc={setScreen} prompt={'Are you sure you want to unpair your card?'}/>}
      {(cmdExecFailed == false) && screen == Screen.UnpairOthers && <UnpairScreen onSubmitFunc={handleUnpair} onCancelFunc={setScreen} prompt={'Are you sure you want to unpair your card from other devices?'}/>}
      {(cmdExecFailed == false) && screen == Screen.FactoryReset && <FactoryResetScreen onSubmitFunc={start} onCancelFunc={setScreen} />}


      {phase == Phase.CardInitialization && cmdExecFailed && <InitializationScreen onSubmitFunc={handleInit} onCancelFunc={handleVerificationCancelled}/>}
      {phase == Phase.CardPairing && cmdExecFailed && <PairingScreen onSubmitFunc={handlePairing} onCancelFunc={handleVerificationCancelled} />}
      {phase == Phase.CardPinVerification && cmdExecFailed && <VerifyPINScreen onSubmitFunc={handleVerifyPin} onCancelFunc={handleVerificationCancelled} pinRetry={pinRetry}/>}
      {phase == Phase.CardLoadKey && cmdExecFailed && <CardLoadKeyScreen onSubmitFunc={handleCardLoadKey} onCancelFunc={setScreen} />}
      <NFCModal isVisible={isModalVisible} modalHeader={modalHeader} modalPrompt={modalPrompt} onChangeFunc={stop} />
    </View>
  );
}
