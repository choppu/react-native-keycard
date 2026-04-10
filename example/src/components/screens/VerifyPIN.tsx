import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";

type VerifyPINScreenProps = {
  onSubmitFunc: (pin: string) => boolean;
  onCancelFunc: (screen: number) => void;
  pinRetry: number;
};

const VerifyPINScreen: React.FC<VerifyPINScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc, pinRetry } = props;

  return (
    <View style={Styles.container}>
      <View style={Styles.screenContainer}>
        <Dialpad pinRetryCounter={pinRetry} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={onSubmitFunc} type='pin' />
      </View>
    </View>
  )
};

export default VerifyPINScreen;
