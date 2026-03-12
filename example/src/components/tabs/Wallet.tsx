import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../Button";
import { Screen } from "../../App";
import Styles from "../../Styles";

type WalletTabProps = {
  onClickFunc: (scree: number) => void;
};

const WalletTab: React.FC<WalletTabProps> = props => {
  const { onClickFunc } = props;

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Text style={Styles.tabHeading}>Wallet</Text>
        <Button label="Create Mnemonic" disabled={false} onChangeFunc={() => onClickFunc(Screen.CreateMnemonic)} type="secondary" />
        <Button label="Load Mnemonic" disabled={false} onChangeFunc={() => onClickFunc(Screen.LoadMnemonic)} type="secondary" />
        <Button label="Change Wallet" disabled={false} onChangeFunc={() => onClickFunc(Screen.ChangeWallet)} type="secondary" />
        <Button label="Show Wallet Address" disabled={false} onChangeFunc={() => onClickFunc(Screen.ShowWallet)} type="secondary" />
        <Button label="Remove Key" disabled={false} onChangeFunc={() => onClickFunc(Screen.RemoveKey)} type="secondary" />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    paddingTop: 10,
    paddingBottom: 10
  },
  buttonContainer: {
    width: '100%',
    height: 100,
  }
})


export default WalletTab;
