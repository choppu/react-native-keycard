import React from "react";
import RNKeycard from "react-native-keycard";
import { Phase } from "../Main";

type NFCCardSessionProps = {
  log: string[];
  setCardPhase: (phase: number) => void;
  modalActive: (state: boolean) => void;
  setModalHeader: (header: string) => void;
  setModalPrompt: (prompt: string) => void;
  setLog: (newLog: string[]) => void;
}

const useNFCCardSession = (props: NFCCardSessionProps) => {
  const updateCardState = React.useCallback((cardState: number, modalHeaderText: string, modalPromptText: string) => {
    props.setModalHeader(modalHeaderText);
    props.setModalPrompt(modalPromptText);
    props.setCardPhase(cardState);
  }, []);

  const start = React.useCallback(async (): Promise<void> => {
    if (await RNKeycard.Core.isNFCSupported() && !(await RNKeycard.Core.isNFCEnabled())) {
      RNKeycard.Core.openNFCSettings();
    }

    await RNKeycard.Core.startNFC("Tap your Keycard");
    props.modalActive(true);
  }, []);

  const stop = React.useCallback(async (): Promise<void> => {
    await RNKeycard.Core.stopNFC();
    props.modalActive(false);
    props.setModalHeader('Ready to Scan');
    props.setModalPrompt('Hold your Keycard near NFC sensor');
  }, []);

  const handleCardInitialized = React.useCallback(() => {
    props.setCardPhase(Phase.CardPairing);
    props.setLog([
      ...props.log,
      `${new Date(Date.now()).toLocaleString("en-GB")} - Card initialized successfully`
    ]);
  }, []);
  const handleCardAuthentic = React.useCallback(() =>
    updateCardState(Phase.CardPairing, 'Card pairing', 'Card authentic. Pairing...'),
    []);
  const handleCardPaired = React.useCallback(() =>
    updateCardState(Phase.CardPairing, 'Open Secure channel', 'Opening secure channel...'),
    []);
  const handleSecureChannelOpened = React.useCallback(() =>
    updateCardState(Phase.CardPinVerification, 'PIN verification', 'Secure channel opened successfully. Verifying PIN...'),
    []);
  const handlePinVerified = React.useCallback(() =>
    updateCardState(Phase.CardCmdExecution, 'Command execution', 'Executing...'),
    []);
  const handleCmdExecuted = React.useCallback(() => props.setCardPhase(Phase.Idle), []);

  return { start, stop, handleCardInitialized, handleCardAuthentic, handleCardPaired, handleSecureChannelOpened, handlePinVerified, handleCmdExecuted };
}

export default useNFCCardSession;
