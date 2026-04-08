import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import Styles, { buttonTextColor, defaultFont, logBgColor, logFont } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";
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
  const [pin, setCurrentPin] = React.useState('');
  const [step, setStep] = React.useState(MnemonicSteps.VerifyPin);
  const [isBtnDisabled, setBtnDisabled] = React.useState<boolean>(true);

  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(MnemonicSteps.LoadMnemonic);
    return true;
  }

  const validateMnemonic = (m: string) => {
    console.log(bip39.validateMnemonic(m, wordlist))
    return bip39.validateMnemonic(m, wordlist);
  }

  const updateMnemonic = (val: string) => {
    const m = val.toString().trim().toLowerCase();
    const isValidMnemonic = validateMnemonic(m);
    setMnemonic(m);
    setBtnDisabled(!isValidMnemonic);
  }

  const loadMnemonic = () => {
    onSubmitFunc(pin, mnemonic);
    return true;
  }


  return (
    <View style={Styles.container}>
      {step == MnemonicSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      {
        step == MnemonicSteps.LoadMnemonic && (
          <View style={styles.successMnemonicContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => setStep(MnemonicSteps.VerifyPin)} type="cancel"></Button>
            </View>
            <Text style={Styles.heading}>Import recovery phrase</Text>
            <View style={styles.mnemonicContainer}>
                <Text style={styles.mnemonic}>{mnemonic.toLowerCase()}</Text>
            </View>
            <TextInput onChangeText={updateMnemonic} style={styles.wordInput} />
            <View>
              <Button label={'Submit'} disabled={isBtnDisabled} onChangeFunc={loadMnemonic} type="secondary" />
            </View>
          </View>
        )
      }
    </View>
  )
};

const styles = StyleSheet.create({
  successMnemonicContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 30,
    paddingTop: 40
  },
  headingContainer: {
    width: '100%',
    height: 570
  },
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 0
  },
  mnemonicContainer: {
    width: '95%',
    margin: 'auto',
    backgroundColor: logBgColor,
    minHeight: 120,
    height: 'auto',
    borderRadius: 20,
    textAlign: 'justify',
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mnemonic: {
    color: 'white',
    fontSize: 12,
    lineHeight: 20,
    fontFamily: logFont,
    textAlign: 'justify',
  },
  wordInput: {
    width: '90%',
    height: 40,
    padding: 6,
    boxSizing: 'border-box',
    borderBottomColor: logBgColor,
    borderBottomWidth: 2,
    borderRadius: 7,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 14,
    fontFamily: defaultFont,
    marginBottom: 300,
    color: buttonTextColor
  }
});

export default LoadMnemonicScreen;
