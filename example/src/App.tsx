/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  type EventSubscription,
  Button,
} from 'react-native';
import RNKeycard from 'react-native-keycard';
import { Commandset } from 'keycard-sdk/dist/commandset';
import { ApplicationInfo } from 'keycard-sdk/dist/application-info';

export default function App() {
  const listenerSubscription = React.useRef<null | EventSubscription>(null);
  const [keycardStatus, setKeycardStatus] = React.useState<string>('false');


  React.useEffect(() => {
    listenerSubscription.current = RNKeycard.Core.onKeycardConnected(async () => {
      console.log('Keycard connected successfully');
      let channel = new RNKeycard.NFCCardChannel();
      setKeycardStatus(channel.isConnected().toString());
      let cmdSet = new Commandset(channel);
      let data = new ApplicationInfo((await cmdSet.select()).checkOK().data);
      console.log(data);
      await RNKeycard.Core.stopNFC();
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, [keycardStatus]);

  async function startNFCConnection(): Promise<void> {
    if (await RNKeycard.Core.isNFCEnabled()) {
      await RNKeycard.Core.startNFC("Tap your card");
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
