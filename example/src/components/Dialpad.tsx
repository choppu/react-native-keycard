import {StyleSheet, Text, View, Dimensions } from "react-native";
import React from "react";
import DialpadKeypad from "./DialpadKeypad";
import Button from "./Button";
import DialpadPin from "./DialpadPin";
import Styles, { buttonTextColor, defaultFont } from "../Styles";

 const { width } = Dimensions.get("window");

 type DialpadProps = {
  buttonLabel?: string;
  pinRetryCounter: number;
  prompt: string;
  onCancelFunc: () => void;
  onNextFunc: (p?: any) => boolean;
};

const Dialpad: React.FC<DialpadProps> = props => {
  const {pinRetryCounter, prompt, buttonLabel, onNextFunc, onCancelFunc} = props;
  const dialPadContent = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "X"];
  const dialPadSize = width * 0.2;
  const dialPadTextSize = dialPadSize * 0.36;
  const [code, setCode] = React.useState([]);
  const [wrongRepeat, setWrongRepeat] = React.useState(false);
  const pinLength = 6;
  const pinSize = 14;

  const updateCode = (item: never) => {
    if (item === "X") {
      setCode((prev) => prev.slice(0, -1));
    } else {
      if (code.length === pinLength) {
        return;
      }
      setCode((prev) => [...prev, item]);
    }
  }

  const onNext = () =>  {
    setWrongRepeat(!onNextFunc(code.join('')));
    setCode([]);
  }

  return (
  <View style={Styles.screenContainer}>
    <View style={styles.textContainer}>
      <View style={styles.backBtnContainer}>
        <Button disabled={false} onChangeFunc={onCancelFunc} type="cancel"></Button>
      </View>
      <Text style={Styles.heading}>{prompt}</Text>
      {pinRetryCounter >= 0 && <Text style={styles.pinAttempts}>Remaining attempts: {pinRetryCounter}</Text>}
      {wrongRepeat && <Text style={styles.pinAttempts}>The PINs do not match</Text>}
      <DialpadPin pinLength={pinLength} pinSize={pinSize} code={code} dialPadContent={dialPadContent} />
      <DialpadKeypad dialPadContent={dialPadContent} dialPadSize={dialPadSize} dialPadTextSize={dialPadTextSize} updateCodeFunc={updateCode}/>
    </View>
    <View style={Styles.footer}>
      <View style={Styles.navContainer}>
        <Button label={buttonLabel ? buttonLabel : "Continue"} disabled={false} onChangeFunc={onNext}></Button>
      </View>
    </View>
  </View>
  )};

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
  pinAttempts: {
    fontSize: 14,
    fontFamily: defaultFont,
    color: buttonTextColor,
    marginTop: 10
  }
});

export default Dialpad;
