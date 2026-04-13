import React from "react";
import { StyleSheet, View } from "react-native";
import Styles, { pVertical } from "../../Styles";
import { Screen, type Wallet } from "../../Main";
import Dialpad from "../Dialpad";
import WalletsList from "../WalletsList";

type WalletAddressScreenProps = {
  addresses: Wallet[];
  onSubmitFunc: (pin: string) => void;
  onCancelFunc: (screen: number) => void;
  onScreenCloseFunc: (wArr: Wallet[]) => void;
};

enum ShowWalletsSteps {
  VerifyPin,
  WalletsList
}

const ShowWalletsScreen: React.FC<WalletAddressScreenProps> = props => {
  const {addresses, onSubmitFunc, onCancelFunc, onScreenCloseFunc } = props;
  const [step, setStep] = React.useState<number>(ShowWalletsSteps.VerifyPin);

  const insertPin = (p: string) => {
    onSubmitFunc(p);
    setStep(ShowWalletsSteps.WalletsList);
    return true;
  }

  const cancelScreen = () => {
    onScreenCloseFunc([] as Wallet[]);
    onCancelFunc(Screen.Home);
  }

  return (
    <View style={Styles.container}>
      {step == ShowWalletsSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      {step == ShowWalletsSteps.WalletsList && (
        <View style={styles.walletsContainer}>
          <WalletsList ethAddresses={addresses} onScreenCloseFunc={cancelScreen}/>
        </View>
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 0
  },
  walletsContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'flex-start',
    paddingVertical: pVertical,
    boxSizing: 'border-box'
  }
});

export default ShowWalletsScreen;
