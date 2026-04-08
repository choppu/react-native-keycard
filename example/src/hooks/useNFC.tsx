import React from "react";
import RNKeycard from "react-native-keycard";

const useNFCSession = (modalActive: (state: boolean) => void, setModalHeader: (header: string) => void, setModalPrompt: (prompt: string) => void) => {
   const start = React.useCallback(async() : Promise<void> =>  {
      if (await RNKeycard.Core.isNFCSupported() && !(await RNKeycard.Core.isNFCEnabled())) {
        RNKeycard.Core.openNFCSettings();
      }

      await RNKeycard.Core.startNFC("Tap your Keycard");
      modalActive(true);
    }, []);

    const stop = React.useCallback(async() : Promise<void> =>  {
      await RNKeycard.Core.stopNFC();
      modalActive(false);
      setModalHeader('Ready to Scan');
      setModalPrompt('Hold your Keycard near NFC sensor');
    }, []);

    return {start, stop};
}

export default useNFCSession;
