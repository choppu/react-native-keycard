import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Styles, { logBgColor } from "../../Styles";
import WalletTab from "../tabs/Wallet";
import SettingsIcon from "../../assets/images/SettingsIcon";
import WalletIcon from "../../assets/images/WalletIcon";
import IconButton from "../IconButton";
import SettingsTab from "../tabs/Settings";

enum Tabs {
  Wallet,
  Settings
}

type HomeScreenProps = {
  logs: string[],
  onClickFunc: (screen: number) => void;
};

const HomeScreen: React.FC<HomeScreenProps> = props => {
  const { logs, onClickFunc } = props;
  const [tab, setTab] = React.useState<number>(Tabs.Wallet);

  const walletIcon = () => {
    return (<WalletIcon width="25" heigth="25" stroke="white" />);
  }

  const settingsIcon = () => {
    return (<SettingsIcon width="25" heigth="25" stroke="white" className="tabIcon"/>);
  }

  return (
    <View style={Styles.container}>
      <View style={styles.logContainer}>
        {logs.map((message, index) => {
          return <Text key={index} style={styles.logMessage}>{message}</Text>
        })}
      </View>
      <View style={styles.screenContentContainer}>
        {tab == Tabs.Wallet && <WalletTab onClickFunc={onClickFunc}/>}
        {tab == Tabs.Settings && <SettingsTab onClickFunc={onClickFunc}/>}
      </View>
      <View style={Styles.tabsContainer}>
        <IconButton  id={1} disabled={false} icon={walletIcon()} onChangeFunc={() => setTab(Tabs.Wallet)} />
        <IconButton  id={2} disabled={false} icon={settingsIcon()} onChangeFunc={() => setTab(Tabs.Settings)} />
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
    padding: 25,
    boxSizing: 'border-box'
  },
  screenContentContainer: {
    flexGrow: 2,
    height: 360
  },
  logMessage: {
    color: 'white',
    fontSize: 12
  }
})


export default HomeScreen;
