import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Styles, { logBgColor, logFont } from "../../Styles";
import WalletTab from "../tabs/Wallet";
import SettingsIcon from "../../assets/images/SettingsIcon";
import WalletIcon from "../../assets/images/WalletIcon";
import IconButton from "../IconButton";
import SettingsTab from "../tabs/Settings";
import Smartcard from "../../assets/images/Smartcard";
import CardTab from "../tabs/Card";
import { Tabs, type CardInfo } from "../../App";

type HomeScreenProps = {
  logs: string[],
  tab: number;
  onTabChangeFunc: (val: number) => void;
  cardInfo: CardInfo,
  onClickFunc: (screen: number) => void;
  onShowCardFunc: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = props => {
  const { logs, cardInfo, tab, onTabChangeFunc, onClickFunc, onShowCardFunc } = props;

  const walletIcon = () => {
    return (<WalletIcon width="25" heigth="25" stroke="white" />);
  }

  const cardIcon = () => {
    return (<Smartcard width="21" heigth="100%" stroke="white" />);
  }

  const settingsIcon = () => {
    return (<SettingsIcon width="25" heigth="25" stroke="white" className="tabIcon"/>);
  }

  return (
    <View style={Styles.container}>
      <ScrollView style={styles.logContainer}>
        {logs.map((message, index) => {
          return <Text key={index} style={styles.logMessage}>{message}</Text>
        })}
      </ScrollView>
      <View style={styles.screenContentContainer}>
        {tab == Tabs.Wallet && <WalletTab onClickFunc={onClickFunc}/>}
        {tab == Tabs.Settings && <SettingsTab onClickFunc={onClickFunc}/>}
        {tab == Tabs.Card && <CardTab onClickFunc={onShowCardFunc} cardInfo={cardInfo}/>}
      </View>
      <View style={Styles.tabsContainer}>
        <IconButton  id={1} disabled={false} icon={walletIcon()} onChangeFunc={() => onTabChangeFunc(Tabs.Wallet)} />
        <IconButton  id={2} disabled={false} icon={settingsIcon()} onChangeFunc={() => onTabChangeFunc(Tabs.Settings)} />
        <IconButton  id={3} disabled={false} icon={cardIcon()} onChangeFunc={() => onTabChangeFunc(Tabs.Card)} />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  logContainer: {
    backgroundColor: logBgColor,
    width: '100%',
    height: 340,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'scroll',
    color: 'white',
    paddingTop: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    boxSizing: 'border-box'
  },
  screenContentContainer: {
    flexGrow: 2,
    height: 360
  },
  logMessage: {
    color: 'white',
    fontSize: 11,
    fontFamily: logFont,
    lineHeight: 16,
    paddingBottom: 2,
    paddingTop: 2
  }
})


export default HomeScreen;
