import React from "react";
import type { NFCCardChannel } from "../../../src/CardChannel";
import { LOADED, PAIRED, type KeycardManager } from "keycard-sdk/dist/keycard-manager";
import type { KeycardManagerArgs } from "keycard-sdk/dist/types/keycard-manager-types";
import { Commandset } from "keycard-sdk/dist/commandset";
import { ApplicationStatus } from "keycard-sdk/dist/application-status";
import { KeyPath } from "keycard-sdk/dist/key-path";
import { Constants } from "keycard-sdk/dist/constants";
import type { CardInfo, Wallet } from "../App";
import { Mnemonic } from "keycard-sdk/dist/mnemonic";
import { BIP32KeyPair } from "keycard-sdk/dist/bip32key";
import { ApplicationInfo } from "keycard-sdk/dist/application-info";
import type { HDKey } from "@scure/bip32";
import { Ethereum } from "keycard-sdk/dist/ethereum";
import { Utils } from "../utils";

type useKeycardProps = {
  kManager: KeycardManager;
  kmArgs: KeycardManagerArgs;
  pinRef: React.RefObject<string | undefined>;
  duressPinRef: React.RefObject<string | undefined>;
  newPinRef: React.RefObject<string | undefined>;
  newPukRef: React.RefObject<string | undefined>;
  mnemonicRef: React.RefObject<string>;
  mnemonicLengthRef: React.RefObject<number>;
  cardInfo: CardInfo;
  setCardInfo: (cInfo: CardInfo) => void;
  setMnemonic: (mnemonic: string) => void;
  setAddresses: (addresses: Wallet[]) => void;
  newPairingPasswordRef: React.RefObject<Uint8Array<ArrayBufferLike> | undefined>
};

const eth_path = "m/44'/60'/0'/0";

const useKeycard = (props: useKeycardProps) => {
  const changePIN = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePIN(props.newPinRef.current!)).checkOK().data
    );
  }, [props.kManager, props.kmArgs, props.newPinRef]);

  const changePUK = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePUK(props.newPukRef.current!)).checkOK().data
    );
  }, [props.kManager, props.kmArgs, props.newPukRef]);

  const changePairing = React.useCallback(async (channel: NFCCardChannel) => {
    console.log(props.kmArgs);
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => (await cmdSet.changePairingPassword(props.newPairingPasswordRef.current!)).checkOK().data
    );
  }, [props.kManager, props.kmArgs, props.newPairingPasswordRef]);

  const unpair = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        const uid = cmdSet.applicationInfo?.instanceUID;
        await cmdSet.autoUnpair();
        if (uid) {
          props.kManager.pairingStorage.deletePairing(uid);
        }
      }
    );
  }, [props.kManager, props.kmArgs]);

  const unpairOthers = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        await cmdSet.unpairOthers();
      }
    );
  }, [props.kManager, props.kmArgs]);

  const getCardInfo = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        const appInfo = cmdSet.applicationInfo;
        const status = new ApplicationStatus((await cmdSet.getStatus(Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);
        const path = new KeyPath((await cmdSet.getStatus(Constants.GET_STATUS_P1_KEY_PATH)).checkOK().data);
        props.setCardInfo({ ...props.cardInfo, appInfo: appInfo!, status: status, path: path });
      }
    );
  }, [props.kManager, props.kmArgs, props.cardInfo]);

  const createMnemonic = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        let resp = (await cmdSet.generateMnemonic((props.mnemonicLengthRef.current == 12 ? Constants.GENERATE_MNEMONIC_12_WORDS : Constants.GENERATE_MNEMONIC_24_WORDS))).checkOK().data;
        let mnemonicPhrase = new Mnemonic(resp);
        mnemonicPhrase.fetchBIP39EnglishWordlist();
        (await cmdSet.loadBIP32KeyPair(mnemonicPhrase.toBIP32KeyPair())).checkOK().data;
        props.setMnemonic(mnemonicPhrase.toMnemonicPhrase());
      }
    )
  }, [props.kManager, props.kmArgs, props.setMnemonic]);

  const loadMnemonic = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        const keyPair = BIP32KeyPair.fromBinarySeed(Mnemonic.toBinarySeed(props.mnemonicRef.current));
        (await cmdSet.loadBIP32KeyPair(keyPair)).checkOK().data;
      }
    )
  }, [props.kManager, props.kmArgs]);

  const exportKey = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      LOADED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        let data = (await cmdSet.exportExtendedKey(0, eth_path, false)).checkOK().data;
        let extendedKey = BIP32KeyPair.extendedKey(data);
        let ethAddresses = [];
        for (let i = 0; i < 9; i++) {
          let key = extendedKey.deriveChild(i);
          ethAddresses[i] = {index: i, address: Utils.compressedPKeyToEthereumAddress(key.publicKey!), publicKey: Utils.hx(key.publicKey!)} as Wallet;
        };
        props.setAddresses(ethAddresses);
      }
    )
  }, [props.kManager, props.kmArgs, props.setAddresses]);

  const removeKey = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        const appInfo = cmdSet.applicationInfo;
        if (appInfo?.hasMasterKey) {
          await cmdSet.removeKey();
        }
      }
    );
  }, [props.kManager, props.kmArgs]);

  const factoryReset = React.useCallback(async (channel: NFCCardChannel) => {
    const cmdSet = new Commandset(channel);
    const appInfo = new ApplicationInfo((await cmdSet.select()).checkOK().data);

    if(appInfo.initializedCard) {
      (await cmdSet.factoryReset()).checkOK();
      props.kManager.pairingStorage.deletePairing(appInfo?.instanceUID!);
      return true;
    }

    return false;
  }, [props.kManager])

  return { createMnemonic, loadMnemonic, exportKey, removeKey, changePIN, changePUK, changePairing, unpair, unpairOthers, getCardInfo, factoryReset };
}

export default useKeycard;
