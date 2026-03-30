import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import PairingInput from "../PairingInput";

type PairingScreenProps = {
  onSubmitFunc: (pass: string) => boolean;
  onCancelFunc: () => void;
};

const PairingScreen: React.FC<PairingScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;

  return (
    <View style={Styles.container}>
      <PairingInput prompt={"Enter pairing password"} onCancelFunc={() => {onCancelFunc}} onNextFunc={onSubmitFunc} type="verify"/>
    </View>
  )
};

export default PairingScreen;
