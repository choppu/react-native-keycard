import React from "react";
import { View } from "react-native";
import Styles from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";
import UseDefaultInit from "./UseDefaultInit";
import PairingInput from "../PairingInput";

type initData = {
  puk: string;
  pairingPassword: string
}

type InitializationScreenProps = {
  onSubmitFunc: (pin: string, duressPin?: string, initData?: initData) => void;
  onCancelFunc: (screen: number) => void;
};

enum InitializationSteps {
  InsertPin,
  ConfirmPin,
  UseDefaultInitCredentials,
  InsertDuressPin,
  ConfirmDuressPin,
  InsertPuk,
  ConfirmPuk,
  InsertPairingPassword,
  ConfirmPairingPassword
}

const InitializationScreen: React.FC<InitializationScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [step, setStep] = React.useState<number>(InitializationSteps.InsertPin);
  const [pin, setPin] = React.useState<string>('');
  const [puk, setPuk] = React.useState<string | undefined>(undefined);
  const [duressPin, setDuressPin] = React.useState<string | undefined>(undefined);
  const [pairingPass, setPairingPass] = React.useState<string | undefined>(undefined);
  const [addInitData, setAddInitData] = React.useState<boolean>(false);


  const insertPin = (p: string) => {
    setPin(p);
    setStep(InitializationSteps.ConfirmPin);
    return true;
  }

  const submitPin = (p: string) => {
    if(pin == p) {
      setStep(InitializationSteps.UseDefaultInitCredentials);
      return true;
    }

    return false;
  }

  const insertDuressPin = (dPin: string) => {
    setDuressPin(dPin);
    setStep(InitializationSteps.ConfirmDuressPin);
    return true;
  }

  const confirmDuressPin = (dPin: string) => {
    if(duressPin == dPin) {
      if(addInitData) {
        setStep(InitializationSteps.InsertPuk);
      } else {
        onSubmitFunc(pin, duressPin);
      }
      return true;
    }

    return false;
  }

  const insertPuk = (p: string) => {
    setPuk(p);
    setStep(InitializationSteps.ConfirmPuk);
    return true;
  }

  const confirmPuk = (p: string) => {
    if(puk == p) {
      setStep(InitializationSteps.InsertPairingPassword);
      return true;
    }

    return false;
  }

  const insertPairingPass = (pass: string) => {
    setPairingPass(pass);
    setStep(InitializationSteps.ConfirmPairingPassword);
    return true;
  }

  const confirmPairingPass = (pass: string) => {
    if(pairingPass == pass) {
      if(puk && pairingPass) {
        onSubmitFunc(pin, duressPin, { puk: puk, pairingPassword: pairingPass});
      }
      return true;
    }

    return false;
  }

  const handleInitData = (setDPin: boolean, setInitData: boolean) => {
    if(setDPin) {
      setStep(InitializationSteps.InsertDuressPin);
      setAddInitData(setInitData);
    } else if(setInitData) {
      setStep(InitializationSteps.InsertPuk);
    } else {
      onSubmitFunc(pin);
    }
  }

  return (
    <View style={Styles.container}>
      { step == InitializationSteps.InsertPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      { step == InitializationSteps.ConfirmPin && (<Dialpad pinRetryCounter={-1} prompt={"Confirm PIN"} onCancelFunc={() => setStep(InitializationSteps.InsertPin)} onNextFunc={submitPin} type='pin' />)}
      { step == InitializationSteps.UseDefaultInitCredentials && (<UseDefaultInit onCancelFunc={() => setStep(InitializationSteps.ConfirmPin)} onNextFunc={handleInitData}/>)}
      { step == InitializationSteps.InsertDuressPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter duress PIN"} onCancelFunc={() => setStep(InitializationSteps.UseDefaultInitCredentials)} onNextFunc={insertDuressPin} type='pin' />)}
      { step == InitializationSteps.ConfirmDuressPin && (<Dialpad pinRetryCounter={-1} prompt={"Confirm duress PIN"} onCancelFunc={() => setStep(InitializationSteps.InsertDuressPin)} onNextFunc={confirmDuressPin} type='pin' />)}
      { step == InitializationSteps.InsertPuk && (<Dialpad pinRetryCounter={-1} prompt={"Enter new PUK"} onCancelFunc={() => setStep(InitializationSteps.ConfirmDuressPin)} onNextFunc={insertPuk} type='puk' />)}
      { step == InitializationSteps.ConfirmPuk && (<Dialpad pinRetryCounter={-1} prompt={"Confirm PUK"} onCancelFunc={() => setStep(InitializationSteps.InsertPuk)} onNextFunc={confirmPuk} type='puk' />)}
      { step == InitializationSteps.InsertPairingPassword && (<PairingInput prompt={"Enter pairing password"} onCancelFunc={() => setStep(InitializationSteps.ConfirmPuk)} onNextFunc={insertPairingPass} />)}
      { step == InitializationSteps.ConfirmPairingPassword && (<PairingInput prompt={"Confirm pairing password"} onCancelFunc={() => setStep(InitializationSteps.InsertPairingPassword)} onNextFunc={confirmPairingPass} />)}
    </View>
  )
};

export default InitializationScreen;
