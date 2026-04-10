import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Styles, { defaultFont } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";
import Button from "../Button";
import Logo from "../../assets/images/Logo";

type RemoveKeyScreenProps = {
  onSubmitFunc: (p: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum RemoveKeySteps {
  RemoveKey,
  VerifyPin
}

const RemoveKeyScreen: React.FC<RemoveKeyScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [step, setStep] = React.useState(RemoveKeySteps.RemoveKey);



  const insertPin = (p: string) => {
    onSubmitFunc(p);
    return true;
  }

  const removeKey = () => {
    setStep(RemoveKeySteps.VerifyPin);
    return true;
  }

  return (
    <View style={Styles.container}>
      {
        step == RemoveKeySteps.RemoveKey && (
          <View style={styles.unpairContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel" />
            </View>
            <View style={styles.unpairPromptContainer}>
              <Logo width="78" heigth="136" stroke="white" />
              <Text style={styles.unpairPrompt}>Are you sure you want to remove key?</Text>
            </View>
            <View style={Styles.navContainer}>
              <Button label="Remove Key" disabled={false} onChangeFunc={removeKey} type="secondary" />
            </View>
          </View>
        )
      }
      {step == RemoveKeySteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => setStep(RemoveKeySteps.RemoveKey)} onNextFunc={insertPin} type='pin' />)}
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
    paddingVertical: 60,
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

export default RemoveKeyScreen;
