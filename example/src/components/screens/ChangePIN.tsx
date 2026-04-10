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
  VerifyPin,
  InsertNewPin,
  RepeatPin
}

const ChangePINScreen: React.FC<ChangePINScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [newPin, setNewPin] = React.useState('');
  const [pin, setCurrentPin] = React.useState('');
  const [step, setStep] = React.useState(PinSteps.VerifyPin);

  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(PinSteps.InsertNewPin);
    return true;
  }

  const insertNewPin = (p: string) => {
    setNewPin(p);
    setStep(PinSteps.RepeatPin);
    return true;
  }

  const submitPin = (p: string) => {
    if(newPin == p) {
      onSubmitFunc(pin, newPin);
      return true;
    }

    return false;
  }


  return (
    <View style={Styles.container}>
      { step == PinSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      { step == PinSteps.InsertNewPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PIN"} onCancelFunc={() => setStep(PinSteps.VerifyPin)} onNextFunc={insertNewPin} type='pin' />)}
      { step == PinSteps.RepeatPin && (<Dialpad pinRetryCounter={-1} prompt={"Repeat new PIN"} onCancelFunc={() => setStep(PinSteps.InsertNewPin)} onNextFunc={submitPin} buttonLabel="Submit" type='pin' />)}
  </View>
  )
};

export default ChangePINScreen;
