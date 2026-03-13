import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";

type ChangePUKScreenProps = {
  onSubmitFunc: (pin: string, newPin: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum PukSteps {
  VerifyPin,
  InsertNewPuk,
  RepeatPuk
}

const ChangePUKScreen: React.FC<ChangePUKScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [newPuk, setNewPuk] = React.useState('');
  const [pin, setCurrentPin] = React.useState('');
  const [step, setStep] = React.useState(PukSteps.VerifyPin);

  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(PukSteps.InsertNewPuk);
    return true;
  }

  const insertNewPin = (p: string) => {
    setNewPuk(p);
    setStep(PukSteps.RepeatPuk);
    return true;
  }

  const submitPin = (p: string) => {
    if(newPuk == p) {
      onSubmitFunc(pin, newPuk);
      return true;
    }

    return false;
  }


  return (
    <View style={Styles.container}>
      { step == PukSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      { step == PukSteps.InsertNewPuk && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PUK"} onCancelFunc={() => setStep(PukSteps.VerifyPin)} onNextFunc={insertNewPin} type='puk' />)}
      { step == PukSteps.RepeatPuk && (<Dialpad pinRetryCounter={-1} prompt={"Repeat new PUK"} onCancelFunc={() => setStep(PukSteps.InsertNewPuk)} onNextFunc={submitPin} buttonLabel="Submit" type='puk'/>)}
  </View>
  )
};

export default ChangePUKScreen;
