import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import { Screen } from "../../Main";
import PairingInput from "../PairingInput";
import Dialpad from "../Dialpad";

type ChangePairingScreenProps = {
  onSubmitFunc: (pin: string, newPairingPassword?: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum PairingSteps {
  InsertNewPairing,
  ConfirmNewPairing,
  VerifyPin
}

const ChangePairingScreen: React.FC<ChangePairingScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [newPairing, setNewPairing] = React.useState<string | undefined>(undefined);
  const [step, setStep] = React.useState(PairingSteps.InsertNewPairing);

  const insertNewPairing = (pass: string | undefined) => {
    setNewPairing(pass);
    setStep(PairingSteps.ConfirmNewPairing);
    return true;
  }

  const submitPairing = (pass: string | undefined) => {
    if(newPairing == pass) {
      setStep(PairingSteps.VerifyPin);
      return true;
    }

    return false;
  }

  const insertPin = (p: string) => {
    onSubmitFunc(p, newPairing);
    return true;
  }


  return (
    <View style={Styles.container}>
      { step == PairingSteps.InsertNewPairing && (<PairingInput prompt={"Enter new pairing password"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertNewPairing} type="change"/>)}
      { step == PairingSteps.ConfirmNewPairing && (<PairingInput prompt={"Confirm pairing password"} onCancelFunc={() => setStep(PairingSteps.InsertNewPairing)} onNextFunc={submitPairing} buttonLabel="Submit" type="change"/>)}
      { step == PairingSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(PairingSteps.ConfirmNewPairing)} onNextFunc={insertPin} type='pin' />)}
  </View>
  )
};

export default ChangePairingScreen;
