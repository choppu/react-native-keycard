import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Styles, { logBgColor, logFont } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../App";
import Button from "../Button";

type CreateMnemonicScreenProps = {
  mnemonic: string;
  lastScreenState: number;
  updateMnemonicFunc: (val: string) => void;
  onSubmitFunc: (pin: string, mnemonicLength: number, screen: number) => void;
  onShowMnemonicFunc: (screen: number) => void;
  onCancelFunc: (screen: number) => void;
};

enum MnemonicSteps {
  VerifyPin,
  SelectMnemonic,
  ShowMnemonic
}

const CreateMnemonicScreen: React.FC<CreateMnemonicScreenProps> = props => {
  const { mnemonic, lastScreenState, onSubmitFunc, onCancelFunc, updateMnemonicFunc, onShowMnemonicFunc } = props;
  const [pin, setCurrentPin] = React.useState('');
  const [step, setStep] = React.useState(lastScreenState);

  const insertPin = (p: string) => {
    setCurrentPin(p);
    setStep(MnemonicSteps.SelectMnemonic);
    return true;
  }

  const createMnemonic = (mnemonicLength: number) => {
    onSubmitFunc(pin, mnemonicLength, MnemonicSteps.ShowMnemonic);
    setStep(MnemonicSteps.ShowMnemonic);
    return true;
  }

  const mnemonicSuccess = () => {
    updateMnemonicFunc('');
    onShowMnemonicFunc(MnemonicSteps.VerifyPin);
    onCancelFunc(Screen.Home);
    return true;
  }


  return (
    <View style={Styles.container}>
      { step == MnemonicSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => onCancelFunc(Screen.Home)} onNextFunc={insertPin} type='pin' />)}
      {
        step == MnemonicSteps.SelectMnemonic && (
          <View style={styles.mnemonicSelectContainer}>
            <Text style={Styles.heading}>Select mnemonic length</Text>
            <View style={styles.mnemonicButtonsContainer}>
              <Button label={'12 words'} disabled={false} onChangeFunc={() => createMnemonic(12)} />
              <Button label={'24 words'} disabled={false} onChangeFunc={() => createMnemonic(24)} />
            </View>
          </View>
        )
      }
      {
        step == MnemonicSteps.ShowMnemonic && (
          <View style={styles.successMnemonicContainer}>
            <Text style={Styles.heading}>Write down recovery phrase</Text>
            <Text style={styles.mnemonic}>{mnemonic}</Text>
            <View>
              <Button label={'Yes, I wrote it down'} disabled={false} onChangeFunc={mnemonicSuccess} type="secondary"/>
            </View>
          </View>
        )
      }
  </View>
  )
};

const styles = StyleSheet.create({
  mnemonicSelectContainer: {
    width: '100%',
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    gap: 300,
    justifyContent: 'space-between'
  },
  successMnemonicContainer: {
    width: '100%',
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center'
  },
  mnemonicButtonsContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 50
  },
  mnemonic: {
    width: '95%',
    margin: 'auto',
    backgroundColor: logBgColor,
    minHeight: 150,
    height: 'auto',
    borderRadius: 20,
    color: 'white',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: logFont,
    textAlign: 'justify',
    padding: 15,
    paddingTop: 30,
    paddingBottom: 30
  }
});

export default CreateMnemonicScreen;
