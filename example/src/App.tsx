/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  type EventSubscription,
  Button,
} from 'react-native';
import { getCardChannel, isNFCEnabled, startNFC, stopNFC } from 'react-native-keycard';
import NativeKeycard from '../../src/NativeKeycard';
import { CashCommandset } from 'keycard-sdk/dist/cash-commandset';
import { CashApplicationInfo } from 'keycard-sdk/dist/cash-application-info';

export default function App() {
  const listenerSubscription = React.useRef<null | EventSubscription>(null);
  const [keycardStatus, setKeycardStatus] = React.useState<string>('false');


  React.useEffect(() => {
    listenerSubscription.current = NativeKeycard?.onKeycardConnected(async () => {
      console.log('Keycard connected successfully');
      let channel = getCardChannel();
      setKeycardStatus(channel.isConnected().toString());

      let cmdSet = new CashCommandset(channel);
      let data = new CashApplicationInfo((await cmdSet.select()).checkOK().data);
      console.log(data);
      await stopNFC();
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, [keycardStatus]);

  async function startNFCConnection(): Promise<void> {
    if (await isNFCEnabled()) {
      await startNFC("Tap your card");
      console.log('NFC started');
    }
  }

  return (
    <View style={styles.container}>
      <Text>Result: {keycardStatus}</Text>
      <Button title={'Start NFC'} onPress={startNFCConnection} />
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
