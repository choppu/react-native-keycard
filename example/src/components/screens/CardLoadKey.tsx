import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen } from "../../App";
import Button from "../Button";

type CardLoadKeyScreenProps = {
  onSubmitFunc: (screen: number) => void;
  onCancelFunc: (screen: number) => void;
};

const CardLoadKeyScreen: React.FC<CardLoadKeyScreenProps> = props => {
  const { onSubmitFunc, onCancelFunc } = props;

  return (
    <View style={styles.loadKeyContainer}>
      <View style={styles.backBtnContainer}>
        <Button disabled={false} onChangeFunc={() => onCancelFunc(Screen.Home)} type="cancel"></Button>
      </View>
      <View style={styles.buttonsContainer}>
        <Button label={'Create mnemonic'} disabled={false} onChangeFunc={() => onSubmitFunc(Screen.CreateMnemonic)} type="secondary"/>
        <Button label={'Load mnemonic'} disabled={false} onChangeFunc={() => onSubmitFunc(Screen.LoadMnemonic)} type="secondary" />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  loadKeyContainer: {
    width: '100%',
    height: '100%',
    paddingTop: 40,
    paddingBottom: 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 0
  },
  buttonsContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 50
  }
});

export default CardLoadKeyScreen;
