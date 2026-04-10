import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";

type ChangePINScreenProps = {
  onSubmitFunc: (pin: string, newPin: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum PinSteps {
  InsertNewPin,
  RepeatPin,
  VerifyPin
}

const ChangePINScreen: React.FC<ChangePINScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [newPin, setNewPin] = React.useState('');
  const [step, setStep] = React.useState(PinSteps.InsertNewPin);

  const insertPin = (p: string) => {
    onSubmitFunc(p, newPin);
    return true;
  }

  const insertNewPin = (p: string) => {
    setNewPin(p);
    setStep(PinSteps.RepeatPin);
    return true;
  }

  const submitPin = (p: string) => {
    if(newPin == p) {
      setStep(PinSteps.VerifyPin);
      return true;
    }

    return false;
  }


  return (
    <View style={Styles.container}>
      { step == PinSteps.InsertNewPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertNewPin} type='pin' />)}
      { step == PinSteps.RepeatPin && (<Dialpad pinRetryCounter={-1} prompt={"Repeat new PIN"} onCancelFunc={() => setStep(PinSteps.InsertNewPin)} onNextFunc={submitPin} buttonLabel="Submit" type='pin' />)}
      { step == PinSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => setStep(PinSteps.RepeatPin)} onNextFunc={insertPin} type='pin' />)}
  </View>
  )
};

export default ChangePINScreen;
