import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";

type VerifyPINScreenProps = {
  onSubmitFunc: (pin: string) => boolean;
  onCancelFunc: (screen: number) => void;
  pinRetry: number;
};

const VerifyPINScreen: React.FC<VerifyPINScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc, pinRetry } = props;

  return (
    <View style={Styles.container}>
      <Dialpad pinRetryCounter={pinRetry} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={onSubmitFunc} type='pin' />
    </View>
  )
};

export default VerifyPINScreen;
