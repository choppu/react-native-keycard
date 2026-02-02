/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  type EventSubscription,
  Button,
} from 'react-native';
import { getCardChannel, isNFCEnabled, startNFC } from 'react-native-keycard';
import NativeKeycard from '../../src/NativeKeycard';
import type { CardChannel } from 'keycard-sdk/dist/card-channel';

export default function App() {
  const listenerSubscription = React.useRef<null | EventSubscription>(null);
  const [keycardStatus, setKeycardStatus] = React.useState<string>('false');
  const [channel, setCardChannel] = React.useState<CardChannel | null>(null);

  React.useEffect(() => {
    listenerSubscription.current = NativeKeycard?.onKeycardConnected(() => {
      console.log('Keycard connected');
      setCardChannel(getCardChannel());
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, [channel]);

  async function startNFCConnection(): Promise<void> {
    if (await isNFCEnabled()) {
      await startNFC();
      console.log('NFC started');
    }
  }

  async function updateKeycardStatus(): Promise<void> {
    if (channel) {
      setKeycardStatus(channel.isConnected().toString());
    }
  }

  return (
    <View style={styles.container}>
      <Text>Result: {keycardStatus}</Text>
      <Button title={'Start NFC'} onPress={startNFCConnection} />
      <Button title={'Check status'} onPress={updateKeycardStatus} />
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
