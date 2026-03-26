import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Styles, { buttonTextColor, defaultFont } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";
import Button from "../Button";
import Logo from "../../assets/images/Logo";

type UnpairScreenProps = {
  onSubmitFunc: (p: string) => void;
  onCancelFunc: (screen: number) => void;
  prompt: string
};

enum UnpairSteps {
  VerifyPin,
  Unpair
}

const UnpairScreen: React.FC<UnpairScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc, prompt } = props;
  const [step, setStep] = React.useState(UnpairSteps.VerifyPin);
  const [pin, setCurrentPin] = React.useState('');



  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(UnpairSteps.Unpair);
    return true;
  }

  const unpair = () => {
    onSubmitFunc(pin);
    return true;
  }

  return (
    <View style={Styles.container}>
      {step == UnpairSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      {
        step == UnpairSteps.Unpair && (
          <View style={styles.unpairContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel" />
            </View>
            <View style={styles.unpairPromptContainer}>
              <Logo width="78" heigth="136" stroke="white"/>
              <Text style={styles.unpairPrompt}>{prompt}</Text>
            </View>
            <View style={Styles.navContainer}>
              <Button label={'Unpair'} disabled={false} onChangeFunc={unpair} type="secondary" />
            </View>
          </View>
        )
      }
    </View>
  )
};

const styles = StyleSheet.create({
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 10
  },
  unpairContainer: {
    width: '100%',
    height: '100%',
    paddingTop: 20,
    paddingBottom: 20,
    boxSizing: 'border-box'
  },
  unpairPromptContainer: {
    width: '100%',
    height: '85%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    gap: 100
  },
  unpairPrompt: {
    color: 'white',
    fontFamily: defaultFont,
    fontSize: 20,
    fontWeight: '200',
    textAlign: 'center',
    lineHeight: 24
  }

});

export default UnpairScreen;
