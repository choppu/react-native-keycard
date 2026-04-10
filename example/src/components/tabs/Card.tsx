import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { buttonTextColor, defaultFont, logBgColor, logFont } from "../../Styles";
import Button from "../Button";
import type { CardInfo } from "../../Main";
import { Utils } from "../../utils";

type CardTabProps = {
  onClickFunc: () => void;
  cardInfo: CardInfo
};

const CardTab: React.FC<CardTabProps> = props => {
  const { onClickFunc, cardInfo } = props;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInfoContainer}>
        <View style={styles.cardInfoField}>
        <Text style={styles.cardInfoLabel}>Instance UID</Text>
        <Text style={styles.cardInfo}>{cardInfo.appInfo ? Utils.hx(cardInfo.appInfo.instanceUID) : '---'}</Text>
      </View>
      <View style={styles.cardInfoField}>
        <Text style={styles.cardInfoLabel}>Key UID</Text>
        <Text style={styles.cardInfo}>{cardInfo.appInfo ? (cardInfo.appInfo.keyUID ? `0x${Utils.hx(cardInfo.appInfo.keyUID)}`: '---') : '---'}</Text>
      </View>
      <View style={styles.cardInfoField}>
        <Text style={styles.cardInfoLabel}>Wallet path</Text>
        <Text style={styles.cardInfo}>{cardInfo.path ? cardInfo.path.toString() : '---'}</Text>
      </View>
      <View style={styles.cardInfoField}>
        <Text style={styles.cardInfoLabel}>Applet version</Text>
        <Text style={styles.cardInfo}>{cardInfo.appInfo ? cardInfo.appInfo.getAppVersionString() : '---'}</Text>
      </View>
      <View style={styles.cardInfoField}>
        <Text style={styles.cardInfoLabel}>Pin retry</Text>
        <Text style={styles.cardInfo}>{cardInfo.status ? cardInfo.status.pinRetryCount : '---'}</Text>
      </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button label="Show Keycard details" disabled={false} onChangeFunc={onClickFunc} />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 12,
  },
  buttonContainer: {
    width: '100%',
    height: 50,
    marginTop: 5
  },
  cardInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 250,
    padding: 5,
    boxSizing: 'border-box',
    width: '95%',
    margin: 'auto'
  },
  cardInfoField: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 10,
    boxSizing: 'border-box',
    alignItems: 'center',
    borderColor: logBgColor,
    borderStyle: "dashed",
    borderBottomWidth: 1,
  },
  cardInfoLabel: {
    color: 'white',
    fontFamily: defaultFont,
    fontWeight: '300',
    fontSize: 13,
    width: 95
  },
  cardInfo: {
    color: buttonTextColor,
    fontFamily: logFont,
    alignContent: 'center',
    fontSize: 11,
    paddingTop: 2,
    width: 'auto',
    maxWidth: 233
  }
});


export default CardTab;
