# Keycard Example App

A React Native example application demonstrating how to use the `react-native-keycard` library to interact with Keycard using NFC connection.

## Overview

This example app showcases the full Keycard workflow including:
- Card initialization
- Pairing management
- PIN/PUK management
- Mnemonic generation / import
- Ethereum wallet derivation
- Signing
- Factory reset

`Keycard Example App` uses `runOnSecureChannel` method of `KeycardManager` class ([`keycard-sdk`](https://github.com/choppu/keycard-sdk)) to facilitate the handling of card initialization, authentication, pairing and opening of secure channel processes.

## Prerequisites

- Node.js >= 20
- Yarn package manager
- iOS: Xcode 14+ with iOS SDK 16+
- Android: Android Studio with API 21+
- Keycard

## Installation

```bash
# Clone project
git clone https://github.com/choppu/react-native-keycard.git
```

Open project in editor. In terminal:

```bash
cd example

# Install dependencies
yarn install

# iOS: Install CocoaPods dependencies
cd ios && bundle exec pod install && cd ..
```

## Running the Example

### Start Metro Bundler

```bash
yarn start
```

### Run on iOS

```bash
yarn ios
```

### Run on Android

```bash
yarn android
```

## Features

### Wallet Tab
- Create mnemonic
- Load mnemonic
- Sign personal message
- Derive and view Ethereum wallet addresses
- Remove key

### Settings Tab
- Change PIN
- Change PUK
- Change pairing password
- Unpair
- Unpair others
- Factory reset card

### Card Tab
- View card application info

## Custom Hooks

The example app uses two custom React hooks to manage Keycard interactions:

### [`useNFCCardSession`](src/hooks/useKeycardNFC.tsx)

This hook manages the NFC session lifecycle for card communication:

- **`start()`**: Initiates NFC scanning and checks for NFC support/enabled status
- **`stop()`**: Stops the NFC session and resets the UI state
- **`handleCardInitialized()`**: Called when the card is successfully initialized
- **`handleCardAuthentic()`**: Called when card authenticated
- **`handleCardPaired()`**: Called when pairing is complete
- **`handleSecureChannelOpened()`**: Called when the secure channel is established
- **`handlePinVerified()`**: Called when PIN verification succeeds
- **`handleCmdExecuted()`**: Called when command execution completes

### [`useKeycard`](src/hooks/useKeycard.tsx)

This hook provides Keycard operation callbacks that wrap the `KeycardManager` API:

| Method | Description |
|--------|-------------|
| `changePIN()` | Changes the card PIN |
| `changePUK()` | Changes the card PUK |
| `changePairing()` | Updates the pairing password |
| `unpair()` | Unpairs the current card and removes stored pairing data |
| `unpairOthers()` | Unpairs all other devices from the card |
| `getCardInfo()` | Retrieves application info, status, and key path |
| `createMnemonic()` | Generates a new BIP39 mnemonic (12 or 24 words) and loads it |
| `loadMnemonic()` | Loads an imported recovery phrase into the card |
| `exportKey()` | Derives Ethereum addresses from the card's key hierarchy |
| `removeKey()` | Removes the loaded key from the card |
| `sign()` | Signs a personal message hash with the given path |
| `factoryReset()` | Resets the card to factory defaults |

Both hooks work together: `useNFCCardSession` handles the NFC connection and state transitions, while `useKeycard` executes the actual Keycard commands once the secure channel is established.

## Showcase

| Feature | Video |
|---------|-------|
| **Card application info** | <video src="https://github.com/user-attachments/assets/69f12d14-7c0e-4430-ae0d-08b1a3a9cc95" controls width="300"></video> |
| **Show wallets** | <video src="https://github.com/user-attachments/assets/a4e4eeeb-1c84-4c5e-87f0-6f2e7ca2720f" controls width="300"></video> |
| **Sign message** | <video src="https://github.com/user-attachments/assets/188e6268-d3f2-4916-8dbf-1bb39932515c" controls width="300"></video> |
| **Factory reset** | <video src="https://github.com/user-attachments/assets/babee5c9-b227-44e5-a2c4-96db74e9f179" controls width="300"></video> |
| **Change PIN** | <video src="https://github.com/user-attachments/assets/4e316cfa-7f17-425e-b7b7-3fadf8c3c963" controls width="300"></video> |
