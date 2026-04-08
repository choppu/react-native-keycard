import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../Button";
import { Screen } from "../../App";
import Styles from "../../Styles";

type WalletTabProps = {
  onClickFunc: (screen: number) => void;
};

const WalletTab: React.FC<WalletTabProps> = props => {
  const { onClickFunc } = props;

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <Text style={Styles.tabHeading}>Wallet</Text>
        <Button label="Create Mnemonic" disabled={false} onChangeFunc={() => onClickFunc(Screen.CreateMnemonic)} type="menu" />
        <Button label="Load Mnemonic" disabled={false} onChangeFunc={() => onClickFunc(Screen.LoadMnemonic)} type="menu" />
        <Button label="Show Wallet Address" disabled={false} onChangeFunc={() => onClickFunc(Screen.ShowWallet)} type="menu" />
        <Button label="Sign Message" disabled={false} onChangeFunc={() => onClickFunc(Screen.Sign)} type="menu" />
        <Button label="Remove Key" disabled={false} onChangeFunc={() => onClickFunc(Screen.RemoveKey)} type="menu" />
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
