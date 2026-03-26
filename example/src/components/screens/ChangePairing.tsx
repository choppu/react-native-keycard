import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import { Screen } from "../../App";
import PairingInput from "../PairingInput";
import Dialpad from "../Dialpad";

type ChangePairingScreenProps = {
  onSubmitFunc: (pin: string, newPairingPassword?: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum PairingSteps {
  VerifyPin,
  InsertNewPairing,
  ConfirmNewPairing
}

const ChangePairingScreen: React.FC<ChangePairingScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [pin, setCurrentPin] = React.useState('');
  const [newPairing, setNewPairing] = React.useState<string | undefined>(undefined);
  const [step, setStep] = React.useState(PairingSteps.VerifyPin);

  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(PairingSteps.InsertNewPairing);
    return true;
  }

  const insertNewPairing = (pass: string | undefined) => {
    setNewPairing(pass);
    setStep(PairingSteps.ConfirmNewPairing);
    return true;
  }

  const submitPairing = (pass: string | undefined) => {
    if(newPairing == pass) {
      setStep(PairingSteps.InsertNewPairing);
      onSubmitFunc(pin, newPairing);
      return true;
    }

    return false;
  }


  return (
    <View style={Styles.container}>
      { step == PairingSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      { step == PairingSteps.InsertNewPairing && (<PairingInput prompt={"Enter new pairing password"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertNewPairing} type="change"/>)}
      { step == PairingSteps.ConfirmNewPairing && (<PairingInput prompt={"Confirm pairing password"} onCancelFunc={() => setStep(PairingSteps.InsertNewPairing)} onNextFunc={submitPairing} buttonLabel="Submit" type="change"/>)}
  </View>
  )
};

export default ChangePairingScreen;
