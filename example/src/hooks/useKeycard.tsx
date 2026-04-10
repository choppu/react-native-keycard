import React from "react";
import type { NFCCardChannel } from "../../../src/CardChannel";
import { LOADED, PAIRED, type KeycardManager } from "keycard-sdk/dist/keycard-manager";
import type { KeycardManagerArgs } from "keycard-sdk/dist/types/keycard-manager-types";
import { Commandset } from "keycard-sdk/dist/commandset";
import { ApplicationStatus } from "keycard-sdk/dist/application-status";
import { KeyPath } from "keycard-sdk/dist/key-path";
import { Constants } from "keycard-sdk/dist/constants";
import { ethPath, type CardInfo, type SignData, type Wallet } from "../Main";
import { Mnemonic } from "keycard-sdk/dist/mnemonic";
import { BIP32KeyPair } from "keycard-sdk/dist/bip32key";
import { ApplicationInfo } from "keycard-sdk/dist/application-info";
import { Ethereum } from "keycard-sdk/dist/ethereum";
import { Utils } from "../utils";
import { RecoverableSignature } from "keycard-sdk/dist/recoverable-signature";

type useKeycardProps = {
  kManager: KeycardManager;
  kmArgs: KeycardManagerArgs;
  pinRef: React.RefObject<string | undefined>;
  duressPinRef: React.RefObject<string | undefined>;
  newPinRef: React.RefObject<string | undefined>;
  newPukRef: React.RefObject<string | undefined>;
  mnemonicRef: React.RefObject<string>;
  mnemonicLengthRef: React.RefObject<number>;
  pathRef: React.RefObject<string | undefined>;
  messageRef: React.RefObject<string | undefined>;
  cardInfo: CardInfo;
  setCardInfo: (cInfo: CardInfo) => void;
  setMnemonic: (mnemonic: string) => void;
  setAddresses: (addresses: Wallet[]) => void;
  setSignResponse: (data: SignData) => void;
  newPairingPasswordRef: React.RefObject<Uint8Array<ArrayBufferLike> | undefined>
};

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
        let data = (await cmdSet.exportExtendedKey(0, ethPath, false)).checkOK().data;
        let extendedKey = BIP32KeyPair.extendedKey(data);
        let ethAddresses = [];
        for (let i = 0; i < 9; i++) {
          let key = extendedKey.deriveChild(i);
          ethAddresses[i] = {index: i, address: Utils.hx(Ethereum.toEthereumAddress(key.publicKey!)), publicKey: Utils.hx(key.publicKey!)} as Wallet;
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

  const sign = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      LOADED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        if(props.messageRef.current && props.pathRef.current) {
          let hash = Ethereum.getMessageHash(Ethereum.encodeEthPersonalMessage(props.messageRef.current));
          const resp = (await cmdSet.signWithPath(hash, props.pathRef.current, false)).checkOK().data;
          const recSignature = new RecoverableSignature({hash: hash, tlvData: resp});
          props.setSignResponse({
            account: props.pathRef.current,
            r: Utils.hx(recSignature.r!),
            s: Utils.hx(recSignature.s!),
            publicKey: Utils.hx(recSignature.publicKey!),
            recId: recSignature.recId!
          });
        }
      }
    )
  }, [props.kManager, props.kmArgs, props.setSignResponse]);

  const getCardInfo = React.useCallback(async (channel: NFCCardChannel) => {
    return await props.kManager.runOnSecureChannel(
      channel,
      PAIRED,
      props.kmArgs,
      async (cmdSet: Commandset) => {
        const appInfo = cmdSet.applicationInfo;
        const status = new ApplicationStatus((await cmdSet.getStatus(Constants.GET_STATUS_P1_APPLICATION)).checkOK().data);
        props.setCardInfo({ ...props.cardInfo, appInfo: appInfo!, status: status });
      }
    );
  }, [props.kManager, props.kmArgs, props.cardInfo]);

  const factoryReset = React.useCallback(async (channel: NFCCardChannel) => {
    const cmdSet = new Commandset(channel);
    const appInfo = new ApplicationInfo((await cmdSet.select()).checkOK().data);

    if(appInfo.initializedCard) {
      (await cmdSet.factoryReset()).checkOK();
      props.kManager.pairingStorage.deletePairing(appInfo?.instanceUID!);
      return true;
    }

    return false;
  }, [props.kManager]);

  return { createMnemonic, loadMnemonic, exportKey, removeKey, sign, changePIN, changePUK, changePairing, unpair, unpairOthers, getCardInfo, factoryReset };
}

export default useKeycard;
