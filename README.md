# React Native Keycard SDK

React Native New Architecture library to interact with Keycard using NFC connection. At the moment, only low-level API (Native Android & iOS NFC communication) is implemented. High-level API is coming soon.

### Installation and setup

`npm install https://github.com/choppu/react-native-keycard.git`


‼️ For `react-native-keycard` & `keycard-sdk` libraries proper functioning `install react-native-get-random-values`.

 #### **React Native Keycard and React Native App without framework**

**Android setup**

 Provide NFC & Camera permissions by updating `android/app/src/main/AndroidManifest.xml` to :

```
<uses-permission android:name="android.permission.NFC"/>
<uses-feature android:name="android.hardware.nfc.hce" android:required="true" />
```

**iOS setup**

1. Insert the following lines inside dict block of `ios/<ProjectDir>/Info.plist` to configure NFC permissions:

```
<key>NFCReaderUsageDescription</key>
<string>$(PRODUCT_NAME) needs access to NFC to interact with Keycard.</string>

...

<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
    <string>A00000080400010101</string>
    <string>A00000080400010301</string>
    <string>A000000151000000</string>
</array>
```

2. Open your project in Xcode, go to `Signing & Capabilities` and add `Near Field Communication Tag Reading` capability.

3. In terminal:

```
cd ios
pod install
```

 #### **React Native Keycard and React Native App with Expo**

 1. Update `app.json` file to configure NFC permissions:

  **Android**

 ```
 "android": {
      ...
      "permissions": ["android.permission.NFC"],
      ...
 }
 ```

  **iOS**

 ```
 ...
"ios": {
      ....
      "entitlements": {
        "com.apple.developer.nfc.readersession.formats": ["TAG"]
      },
      "infoPlist": {
        "NFCReaderUsageDescription": "This app needs access to NFC to interact with Keycard.",
        "com.apple.developer.nfc.readersession.iso7816.select-identifiers": [
          "A00000080400010101",
          "A00000080400010301",
          "A000000151000000"
        ]
      }
    },
 ```

2. Write a custom config plugin for `react-native-keycard` to make custom native changes.

    In project directory, create a `expo-custom` directory and add `app.plugin.ts`.

    Example `app.plugin.ts`

  ```
  import { ExpoConfig } from '@expo/config-types';
  import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';


 // Set  the android.hardware.nfc.hce feature required to true in AndroidManifest.xml
const withAndroidFeatures: ConfigPlugin = config => {
  return withAndroidManifest(config, async (config: any) => {
      const existingFeature = config.modResults.manifest['uses-feature']?.find((p: any) => p['$'] && p['$']['android:name'] === 'android.hardware.nfc.hce');

      if (!existingFeature) {
        config.modResults.manifest['uses-feature'] =
          config.modResults.manifest['uses-feature'] ?? [];
        config.modResults.manifest['uses-feature'].push({
          $: {
            'android:name': 'android.hardware.nfc.hce',
            'android:required': 'true'
          },
        });
      }

      return config;
    });
}

//configuration function
const withKeycardSDK = (config: ExpoConfig) => {
  config = withAndroidFeatures(config);
  return config;
};

export default withKeycardSDK;
```

3. Create `app.config.ts` for dynamic plugins configuration in `app.json`.

    Example code to dynamically update plugins block adding `app.plugin`:

```
import "tsx/cjs";
import withKeycardSDK from './expo-custom/app.plugin';

export default ({ config }) => {
  if (!config.plugins) config.plugins = [];
  config.plugins.push(
    withKeycardSDK,
  );
  return config;
};
```

4. Run `npx expo prebuild --clean`. Learn how to adopt Expo Prebuild in a project that was bootstrapped with React Native CLI [here](https://docs.expo.dev/guides/adopting-prebuild/).


## Low-level API usage

The current version of the library is implementing only the `(Android / iOS) Device <-> Keycard` NFC communication and event handling, `NFCCardChannel` creation, low-level `APDU send` method. For high-level API please use Typescript `keycard-sdk`, which is meant for development of applications for Keycard. Check [`keycard-sdk` page](https://github.com/choppu/keycard-sdk) for more details on installation and usage.

The exposed part of the library is divided in 3 parts.

### `RNKeycard.Core` methods

#### isNFCSupported

checks if NFC is supported.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

const nfcSupported = await RNKeycard.Core.isNFCSupported();
console.log(nfcSupported);
```

Returns `Promise<boolean>`.

#### isNFCEnabled

checks if NFC is enabled.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  console.log('NFC started');
} else {
  await openNFCSettings();

  ...do something...

}
```

Returns `Promise<boolean>`.

#### openNFCSettings

opens NFC Settings on Android. Unsupported on iOS.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  console.log('NFC started');
} else {
  await openNFCSettings();

  ...do something...

}
```

Returns `Promise<boolean>`.

#### setNFCMessage

updates the alert message on iOS. Unsupported on Android.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  await RNKeycard.Core.setNFCMessage("Custom message");

  console.log('NFC started');
} else {
  await openNFCSettings();

  ...do something...

}
```

Returns `Promise<void>`.

#### startNFC

starts NFC.

**Parameters**

* `message` string: a message to show on NFC modal screen.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  console.log('NFC started');
} else {
  await openNFCSettings();

  ...do something...

}
```

Returns `Promise<boolean>`.

#### stopNFC

stops NFC.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

RNKeycard.Core.onKeycardNFCEnabled(async () => {

  ...do something..

  await RNKeycard.Core.stopNFC();
});


if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  console.log('NFC started');
}
```

Returns `Promise<boolean>`.

#### isKeycardConnected

checks Keycard connection status.

**Example**

```
import React from 'react';
import RNKeycard from 'react-native-keycard';

RNKeycard.Core.onKeycardNFCEnabled(async () => {

  ...do something..

  const keycardConnected = RNKeycard.Core.isKeycardConnected();
  console.log(keycardConnected);
});


if (await RNKeycard.Core.isNFCEnabled()) {
  await RNKeycard.Core.startNFC("Tap your card");
  console.log('NFC started');
}
```

Returns `boolean`.

#### send

sends a Keycard APDU command. Low-level `send` method.

**Parameters**

* `apdu` hex string: a command to send.

**Example**

Check `RNKeycard.NFCCardChannel` `send` method implementation for usage details.

Returns `Promise<{data: string, state: string}>`. Data is returned as hex string.

### `RNKeycard.Core` events

* #### onKeycardConnected
* #### onKeycardDisconnected
* #### onKeycardNFCEnabled
* #### onKeycardNFCDisabled
* #### onNFCUserCancelled
* #### onNFCTimeout

`RNKeycard.NFCCardChannel` methods

`RNKeycard.NFCCardChannel` is a high-level implementation of NFC Card Channel, which gives an abstraction level to core `send` function. Implements `CardChannel` interface of [Typescript `keycard-sdk`](https://github.com/choppu/keycard-sdk).

#### send

sends a Keycard APDU command. Low-level `send` method.

**Parameters**

* `cmd` [APDUCommand](https://github.com/choppu/keycard-sdk/blob/master/src/apdu-command.ts): a command to send.

Returns `Promise`<[APDUResponse](https://github.com/choppu/keycard-sdk/blob/master/src/apdu-response.ts)>.

#### isConnected

checks Keycard connection status.

Returns `boolean`.

### `RNKeycard.Smartcard`

`RNKeycard.Smartcard` is meant to be a high-level implementation of all available Typescript Keycard SDK methods.

‼️ If low-level API is used, usage of `keycard-sdk` for full functonality is strongly recommended.

For complete usage example check [Example project](https://github.com/choppu/react-native-keycard/blob/main/example/src/App.tsx) of the library.










