import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";
import Button from "./Button";
import Styles, { buttonTextColor, defaultFont, logBgColor, neutralSolid } from "../Styles";
import BlurView from "@sbaiahmed1/react-native-blur";
import Checkbox from "./Checkbox";

type PairingInputProps = {
  buttonLabel?: string;
  type: 'change' | 'verify';
  prompt: string;
  onCancelFunc: () => void;
  onNextFunc: (p?: any) => boolean;
};

const PairingInput: React.FC<PairingInputProps> = props => {
  const { prompt, buttonLabel, onNextFunc, onCancelFunc, type } = props;
  const [pass, setPass] = React.useState<string | undefined>(undefined);
  const wrongRepeatTextRef = React.useRef<string>(`The pairing passwords do not match`);
  const [wrongRepeat, setWrongRepeat] = React.useState<boolean>(false);
  const [useDefaultPassword, setUseDefaultPassword] = React.useState<boolean>(false);

  const onNext = () => {
    const p = useDefaultPassword ? undefined : pass;

    setWrongRepeat(!onNextFunc(p));
    console.log("Hello");
    setPass(undefined);
  }

  return (
    <View style={Styles.screenContainer}>
      <View style={styles.textContainer}>
        <View style={styles.backBtnContainer}>
          <Button disabled={false} onChangeFunc={onCancelFunc} type="cancel"></Button>
        </View>
        <Text style={Styles.heading}>{prompt}</Text>
        {wrongRepeat && <Text style={styles.wrongPassText}>{wrongRepeatTextRef.current}</Text>}
        <BlurView blurType="extraDark" blurAmount={40} style={styles.inputContainer}>
          <TextInput style={useDefaultPassword ? styles.pairingInputDisabled : styles.pairingInputEbabled} onChangeText={setPass} value={pass} secureTextEntry={true} cursorColor={buttonTextColor} readOnly={useDefaultPassword} />
          {type == 'change' && (<View style={styles.checkContainer}><Checkbox label="Use default pairing password" onChangeFunc={setUseDefaultPassword} state={useDefaultPassword} checkBgColor={neutralSolid} /></View>)}
        </BlurView>
      </View>
      <View style={Styles.footer}>
        <View style={Styles.navContainer}>
          <Button label={buttonLabel ? buttonLabel : "Continue"} disabled={type == 'verify' ? (pass == undefined) : false} onChangeFunc={onNext} type="secondary" />
        </View>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  textContainer: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: 40,
    gap: 10
  },
  inputContainer: {
    width: '90%',
    height: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 12,
    marginTop: 60,
    marginBottom: 40,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 15,
    paddingBottom: 15,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10
  },
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 10
  },
  wrongPassText: {
    fontSize: 14,
    fontFamily: defaultFont,
    color: buttonTextColor,
    marginTop: 10
  },
  pairingInputEbabled: {
    borderBottomColor: logBgColor,
    width: '100%',
    height: 40,
    padding: 6,
    boxSizing: 'border-box',
    borderBottomWidth: 2,
    borderRadius: 7,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 18,
    fontFamily: defaultFont,
    fontWeight: '300',
    color: buttonTextColor
  },
  pairingInputDisabled: {
    borderBottomColor: 'black',
    width: '100%',
    height: 40,
    padding: 6,
    boxSizing: 'border-box',
    borderBottomWidth: 2,
    borderRadius: 7,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 18,
    fontFamily: defaultFont,
    fontWeight: '300',
    color: buttonTextColor
  },

  checkContainer: {
    width: '100%',
    marginTop: 10
  }
});

export default PairingInput;
