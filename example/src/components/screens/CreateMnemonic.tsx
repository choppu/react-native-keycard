import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Styles, { logBgColor, logFont } from "../../Styles";
import Dialpad from "../Dialpad";
import { Screen } from "../../Main";
import Button from "../Button";

type CreateMnemonicScreenProps = {
  mnemonic: string;
  startScreen: number | undefined;
  lastScreenState: number;
  updateMnemonicFunc: (val: string) => void;
  onSubmitFunc: (pin: string, mnemonicLength: number, screen: number) => void;
  onShowMnemonicFunc: (screen: number) => void;
  onCancelFunc: (screen: number) => void;
};

export enum MnemonicSteps {
  SelectMnemonic,
  VerifyPin,
  ShowMnemonic
}

const CreateMnemonicScreen: React.FC<CreateMnemonicScreenProps> = props => {
  const { mnemonic, lastScreenState, startScreen, onSubmitFunc, onCancelFunc, updateMnemonicFunc, onShowMnemonicFunc } = props;
  const [step, setStep] = React.useState<number>(lastScreenState);
  const [mnemonicLength, setMnemonicLength] = React.useState<number>(12);

  const insertPin = (p: string) => {
    onSubmitFunc(p, mnemonicLength, MnemonicSteps.ShowMnemonic);
    setStep(MnemonicSteps.ShowMnemonic);
    return true;
  }

  const createMnemonic = (mLength: number) => {
    setMnemonicLength(mLength);
    setStep(MnemonicSteps.VerifyPin);
    return true;
  }

  const mnemonicSuccess = () => {
    updateMnemonicFunc('');
    onShowMnemonicFunc(MnemonicSteps.VerifyPin);
    onCancelFunc(startScreen == undefined ? Screen.Home : startScreen);
    return true;
  }


  return (
    <View style={Styles.container}>
      {
        step == MnemonicSteps.SelectMnemonic && (
          <View style={styles.mnemonicSelectContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel"></Button>
            </View>
            <View style={styles.headingContainer}>
              <Text style={Styles.heading}>Select mnemonic length</Text>
            </View>
            <View style={styles.mnemonicButtonsContainer}>
              <Button label={'12 words'} disabled={false} onChangeFunc={() => createMnemonic(12)} />
              <Button label={'24 words'} disabled={false} onChangeFunc={() => createMnemonic(24)} />
            </View>
          </View>
        )
      }
      {step == MnemonicSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => setStep(MnemonicSteps.SelectMnemonic)} onNextFunc={insertPin} type='pin' />)}
      {
        step == MnemonicSteps.ShowMnemonic && (
          <View style={styles.successMnemonicContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => setStep(MnemonicSteps.SelectMnemonic)} type="cancel"></Button>
            </View>
            <Text style={Styles.heading}>Write down recovery phrase</Text>
            <View style={styles.mnemonicContainer}>
              {mnemonic && mnemonic.split(' ').map((word: string, index: number) => {
              return <Text key={index} style={styles.mnemonic}>{index + 1}. {word}</Text>
            })
            }
            </View>
            <View>
              <Button label={'Yes, I wrote it down'} disabled={false} onChangeFunc={mnemonicSuccess} type="secondary" />
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
    height: '92%',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  successMnemonicContainer: {
    width: '100%',
    height: '92%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center',
    paddingBottom: 60,
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
    paddingBottom: 50,
  },
  headingContainer: {
    width: '100%',
    height: '77%'
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
    minHeight: 150,
    height: 'auto',
    borderRadius: 20,
    textAlign: 'justify',
    padding: 10,
    paddingTop: 30,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mnemonic: {
    flexBasis: '30%',
    color: 'white',
    fontSize: 12,
    lineHeight: 20,
    fontFamily: logFont
  }
});

export default CreateMnemonicScreen;
