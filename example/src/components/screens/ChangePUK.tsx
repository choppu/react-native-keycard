import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";

type ChangePUKScreenProps = {
  onSubmitFunc: (pin: string, newPin: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum PukSteps {
  InsertNewPuk,
  RepeatPuk,
  VerifyPin
}

const ChangePUKScreen: React.FC<ChangePUKScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [newPuk, setNewPuk] = React.useState('');
  const [step, setStep] = React.useState(PukSteps.InsertNewPuk);

  const insertPin = (p: string) => {
    onSubmitFunc(p, newPuk);
    return true;
  }

  const insertNewPuk = (p: string) => {
    setNewPuk(p);
    setStep(PukSteps.RepeatPuk);
    return true;
  }

  const submitPuk = (p: string) => {
    if(newPuk == p) {
      setStep(PukSteps.VerifyPin);
      return true;
    }

    return false;
  }


  return (
    <View style={Styles.container}>
      { step == PukSteps.InsertNewPuk && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PUK"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertNewPuk} type='puk' />)}
      { step == PukSteps.RepeatPuk && (<Dialpad pinRetryCounter={-1} prompt={"Repeat new PUK"} onCancelFunc={() => setStep(PukSteps.InsertNewPuk)} onNextFunc={submitPuk} buttonLabel="Submit" type='puk'/>)}
      { step == PukSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter current PIN"} onCancelFunc={() => setStep(PukSteps.RepeatPuk)} onNextFunc={insertPin} type='pin' />)}
  </View>
  )
};

export default ChangePUKScreen;
