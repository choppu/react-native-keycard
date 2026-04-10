import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Button from "./Button";
import { type Wallet } from "../Main";
import Styles, { buttonTextColor, defaultFont, logBgColor, logFont, white40 } from "../Styles";
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';


enum Wallets {
  List,
  EthWallet
}

type WalletsListProps = {
  ethAddresses: Wallet[];
  onScreenCloseFunc: () => void;
};

const WalletsList: React.FC<WalletsListProps> = props => {
  const { ethAddresses, onScreenCloseFunc } = props;
  const [walletScreen, setWalletScreen] = React.useState<number>(Wallets.List);
  const [selectedAddress, setSelectedAddress] = React.useState<Wallet | undefined>(undefined);

  const showAddress = React.useCallback((w: Wallet) => {
    setSelectedAddress(w);
    setWalletScreen(Wallets.EthWallet);
  }, [ethAddresses, walletScreen, selectedAddress]);

  const copyAddress = React.useCallback((address: string) => {
    Clipboard.setString(address);
  }, []);

  return (
    <View>
      {walletScreen == Wallets.List && (
        <View style={styles.container}>
          <View style={styles.backBtnContainer}>
            <Button disabled={false} onChangeFunc={onScreenCloseFunc} type="remove"></Button>
          </View>
          <Text style={Styles.heading}>Ethereum Address</Text>
          <View style={styles.buttonsContainer}>
          {ethAddresses.map((wAdd: Wallet, i: number) => {
        return (
          <View key={i} style={styles.buttonContainer}>
            <Text style={styles.addressIndex}>{i}</Text>
            <View style={styles.button}>
              <Button key={`btn-${i}`} label={`0x${wAdd.address}`} disabled={false} onChangeFunc={() => showAddress(wAdd)} type="address" />
            </View>
          </View>
        )
      })}
        </View>
        </View>

      )}
      {walletScreen == Wallets.EthWallet && (
        <View style={styles.walletContainer}>
          <View style={styles.backBtnContainer}>
            <Button disabled={false} onChangeFunc={() => setWalletScreen(Wallets.List)} type="cancel" />
          </View>
          <Text style={Styles.heading}>Account {selectedAddress?.index}</Text>
          <View style={styles.qrContainer}>
            <QRCode value={selectedAddress?.address} size={280} backgroundColor="white"/>
          </View>
          <Text style={styles.ethAddress}>0x{selectedAddress?.address}</Text>
          <Text style={styles.pubKey}>Public Key 0x{selectedAddress?.publicKey}</Text>
          <View style={styles.copyButtonContainer}>
            <Button label='Copy address' disabled={false} onChangeFunc={() => copyAddress(selectedAddress?.address!)} type="secondary" />
          </View>
        </View>
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 0
  },
  container: {
    width: '100%',
    marginTop: -15
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 10
  },
  buttonContainer: {
    width: '100%',
    height: 'auto',
    padding: 4,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottomColor: logBgColor,
    borderBottomWidth: 1,
  },
  addressIndex: {
    color: 'white',
    borderColor: white40,
    borderWidth: 1,
    width: 22,
    height: 22,
    textAlign: 'center',
    lineHeight: 20,
    borderRadius: 6,
    fontFamily: defaultFont,
    fontSize: 12
  },
  button: {
    width: '92%',
  },
  walletContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  qrContainer: {
    width: 320,
    height: 320,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10
  },
  ethAddress: {
    color: 'white',
    fontSize: 17,
    fontFamily: logFont,
    fontWeight: '400',
    paddingLeft: 35,
    paddingRight: 35,
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  pubKey: {
    color: buttonTextColor,
    fontSize: 14,
    fontFamily: logFont,
    fontWeight: '300',
    paddingLeft: 35,
    paddingRight: 35,
    paddingTop: 15,
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  copyButtonContainer: {
    height: 40,
    marginTop: 60
  }
})


export default WalletsList;
