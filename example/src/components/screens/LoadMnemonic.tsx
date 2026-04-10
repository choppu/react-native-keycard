import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import Styles, { buttonTextColor, defaultFont, logBgColor, logFont, neutral90 } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";
import Button from "../Button";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

type LoadMnemonicScreenProps = {
  onSubmitFunc: (pin: string, mnemonic: string) => void;
  onCancelFunc: (screen: number) => void;
};

enum MnemonicSteps {
  VerifyPin,
  LoadMnemonic,
}

const LoadMnemonicScreen: React.FC<LoadMnemonicScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;
  const [mnemonic, setMnemonic] = React.useState<string>('');
  const [step, setStep] = React.useState(MnemonicSteps.LoadMnemonic);
  const [isBtnDisabled, setBtnDisabled] = React.useState<boolean>(true);

  const insertPin = (p: string) => {
    onSubmitFunc(p, mnemonic);
    return true;
  }

  const validateMnemonic = (m: string) => {
    return bip39.validateMnemonic(m, wordlist);
  }

  const updateMnemonic = (val: string) => {
    const m = val.toString().trim().toLowerCase();
    const isValidMnemonic = validateMnemonic(m);
    setMnemonic(m);
    setBtnDisabled(!isValidMnemonic);
  }

  const loadMnemonic = () => {
    setStep(MnemonicSteps.VerifyPin);
    return true;
  }


  return (
    <View style={Styles.container}>
      {
        step == MnemonicSteps.LoadMnemonic && (
          <View style={styles.container}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel"></Button>
            </View>
            <Text style={Styles.heading}>Import recovery phrase</Text>
            <TextInput onChangeText={updateMnemonic} style={styles.wordInput}numberOfLines={10} multiline={true} submitBehavior={'blurAndSubmit'}/>
            <View>
              <Button label={'Submit'} disabled={isBtnDisabled} onChangeFunc={loadMnemonic} type="secondary" />
            </View>
          </View>
        )
      }
      {step == MnemonicSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => setStep(MnemonicSteps.LoadMnemonic)} onNextFunc={insertPin} type='pin' />)}
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'center',
    paddingBottom: 30,
    paddingTop: 40
  },
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 0
  },
  wordInput: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderBottomWidth: 2,
    marginTop: 30,
    marginBottom: 300,
    color: buttonTextColor,
    fontSize: 16,
    fontFamily: defaultFont,
    fontWeight: '300',
    backgroundColor: neutral90,
    borderColor: logBgColor,
    borderRadius: 6,
    height: 180,
    textAlignVertical: 'top',
    padding: 8,
    boxSizing: 'border-box'
  }
});

export default LoadMnemonicScreen;
