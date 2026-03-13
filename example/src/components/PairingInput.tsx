import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import Button from "./Button";
import Styles, { buttonTextColor, defaultFont } from "../Styles";

type PairingInputProps = {
  buttonLabel?: string;
  prompt: string;
  onCancelFunc: () => void;
  onNextFunc: (p?: any) => boolean;
};

const PairingInput: React.FC<PairingInputProps> = props => {
  const { prompt, buttonLabel, onNextFunc, onCancelFunc } = props;
  const [pass, setPass] = React.useState<string | undefined>(undefined);
  const wrongRepeatTextRef = React.useRef<string>(`The pairing passwords do not match`);
  const [wrongRepeat, setWrongRepeat] = React.useState(false);


  const onNext = () => {
    setWrongRepeat(!onNextFunc(pass));
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
        <TextInput style={styles.pairingInput} onChangeText={setPass} value={pass} />
      </View>
      <View style={Styles.footer}>
        <View style={Styles.navContainer}>
          <Button label={buttonLabel ? buttonLabel : "Continue"} disabled={false} onChangeFunc={onNext} type="secondary" />
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

  }
});

export default PairingInput;
