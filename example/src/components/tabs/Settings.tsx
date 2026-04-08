import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../Button";
import { Screen } from "../../App";
import Styles from "../../Styles";

type SettingsTabProps = {
  onClickFunc: (screen: number) => void;
};

const SettingsTab: React.FC<SettingsTabProps> = props => {
  const { onClickFunc } = props;

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Text style={Styles.tabHeading}>Settings</Text>
        <Button label="Change PIN" disabled={false} onChangeFunc={() => onClickFunc(Screen.ChangePIN)} type="menu" />
        <Button label="Change PUK" disabled={false} onChangeFunc={() => onClickFunc(Screen.ChangePUK)} type="menu" />
        <Button label="Change Pairing" disabled={false} onChangeFunc={() => onClickFunc(Screen.ChangePairing)} type="menu" />
        <Button label="Unpair" disabled={false} onChangeFunc={() => onClickFunc(Screen.Unpair)} type="menu" />
        <Button label="Unpair Others" disabled={false} onChangeFunc={() => onClickFunc(Screen.UnpairOthers)} type="menu" />
        <Button label="Factory Reset" disabled={false} onChangeFunc={() => onClickFunc(Screen.FactoryReset)} type="menu" />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 7,
    paddingBottom: 7
  },
  buttonContainer: {
    width: '100%',
    height: 100,
  }
})


export default SettingsTab;
