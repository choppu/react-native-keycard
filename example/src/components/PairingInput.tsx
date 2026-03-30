import { StyleSheet, Text, View } from "react-native";
import { TextInput } from 'react-native-paper';
import React from "react";
import Button from "./Button";
import Styles, { buttonTextColor, defaultFont, neutralSolid, white80 } from "../Styles";
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
          <TextInput mode="flat" style={styles.pairingInput} underlineColor={white80} underlineStyle={{borderWidth: 1}} activeUnderlineColor={buttonTextColor} textColor={buttonTextColor} onChangeText={setPass} value={pass} secureTextEntry={true} cursorColor={buttonTextColor} disabled={useDefaultPassword}/>
          {type == 'change' && (<Checkbox label="Use default pairing password" onChangeFunc={setUseDefaultPassword} state={useDefaultPassword} checkBgColor={neutralSolid}/>)}
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: 40
  },
  inputContainer: {
    width: '90%',
    height: 150,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 12,
    marginTop: 60,
    marginBottom: 40,
    padding: 10,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center'
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
  pairingInput: {
    color: buttonTextColor,
    boxSizing: 'border-box',
    fontSize: 18,
    fontFamily: defaultFont,
    fontWeight: '300',
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 4
  }
});

export default PairingInput;
