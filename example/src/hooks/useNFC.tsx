import React from "react";
import RNKeycard from "react-native-keycard";

const useNFCSession = (modalActive: (state: boolean) => void) => {
   const start = React.useCallback(async() : Promise<void> =>  {
      if (await RNKeycard.Core.isNFCSupported() && !RNKeycard.Core.isNFCEnabled()) {
        RNKeycard.Core.openNFCSettings();
      }

      await RNKeycard.Core.startNFC("Tap your Keycard");
      modalActive(true);
    }, []);

    const stop = React.useCallback(async() : Promise<void> =>  {
      await RNKeycard.Core.stopNFC();
      modalActive(false);
    }, []);

    return {start, stop};
}

export default useNFCSession;
