/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
} from 'react-native';
import RNKeycard from 'react-native-keycard';
import { Commandset } from 'keycard-sdk/dist/commandset';
import { KeycardManager, PAIRED } from 'keycard-sdk/dist/keycard-manager';
import { Constants } from 'keycard-sdk/dist/constants';
import { LocalPairingStorage } from '../../src/LocalPairingStorage';

const kManager = new KeycardManager(new LocalPairingStorage());
const authCert = new Uint8Array([0x02, 0x9a, 0xb9, 0x9e, 0xe1, 0xe7, 0xa7, 0x1b, 0xdf, 0x45, 0xb3, 0xf9, 0xc5, 0x8c, 0x99, 0x86, 0x6f, 0xf1, 0x29, 0x4d, 0x2c, 0x1e, 0x30, 0x4e, 0x22, 0x8a, 0x86, 0xe1, 0x0c, 0x33, 0x43, 0x50, 0x1c]);


export default function App() {
  const [phase, setPhase] = React.useState<string>('NFC disconnected');

  const startNFC = async() : Promise<void> =>  {
    if (await RNKeycard.Core.isNFCSupported() && !await RNKeycard.Core.isNFCEnabled()) {
      await RNKeycard.Core.openNFCSettings();
    }

    await RNKeycard.Core.startNFC("Tap your Keycard");
    setPhase("NFC connected");
  }

  const handleCardConnected = async(): Promise<void> => {
    setPhase('Keycard connected successfully');
    const channel = new RNKeycard.NFCCardChannel();
    setPhase('Keycard channel created');
    let response = await kManager.runOnSecureChannel(
        channel,
        PAIRED,
        { newPin: '123456', skipVerificationUID: [], cardPublicKeys: [authCert] },
        async (cmdSet: Commandset) => (await cmdSet.generateMnemonic(Constants.GENERATE_MNEMONIC_12_WORDS)).checkOK().data
    );
    console.log(response);
    await RNKeycard.Core.stopNFC();
    setPhase("NFC disconnected");
  }

  const handleCardInitialized = () => {
    setPhase("Card initialized");
  }

  const handleCardAuthentic = () => {
    setPhase("Card authenticity success");
  }

  const handleCardPaired = () => {
    setPhase("Card paired");
  }

  const handleSecureChannelOpened = () => {
    setPhase("Secure channel opened successfully");
  }

  const handlePinVerified = () => {
    setPhase("Card initialized");
  }

  const handleCmdExecuted = () => {
    setPhase("Cmd executed successfully");
  }


  React.useEffect(() => {
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
  }, []);

  return (
    <View style={styles.container}>
      <Text>Status: {phase}</Text>
      <Button title={'Start NFC'} onPress={startNFC} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
