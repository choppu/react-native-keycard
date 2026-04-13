import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Styles, {defaultFont, pVertical } from "../../Styles";
import { Screen } from "../../Main";
import Button from "../Button";
import Logo from "../../assets/images/Logo";

type FactoryResetScreenProps = {
  onSubmitFunc: () => void;
  onCancelFunc: (screen: number) => void;
};

const FactoryResetScreen: React.FC<FactoryResetScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;

  return (
    <View style={Styles.container}>
          <View style={styles.resetContainer}>
            <View style={styles.backBtnContainer}>
              <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel" />
            </View>
            <Text style={Styles.heading}>Factory reset</Text>
            <View style={styles.resetPromptContainer}>
              <Logo width="78" heigth="136" stroke="white"/>
              <Text style={styles.resetPrompt}>Factory reset permanently erases key pair on your Keycard. Ensure you back up your seed phrase before proceeding.</Text>
            </View>
            <View style={Styles.navContainer}>
              <Button label={'Factory reset Keycard'} disabled={false} onChangeFunc={onSubmitFunc} type="secondary" />
            </View>
          </View>
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
  resetContainer: {
    width: '100%',
    height: '100%',
    paddingVertical: pVertical,
    boxSizing: 'border-box'
  },
  resetPromptContainer: {
    width: '100%',
    height: '85%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    gap: 80
  },
  resetPrompt: {
    color: 'white',
    fontFamily: defaultFont,
    fontSize: 20,
    fontWeight: '200',
    textAlign: 'center',
    lineHeight: 24
  }

});

export default FactoryResetScreen;
