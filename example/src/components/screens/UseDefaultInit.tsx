import React from "react";
import Styles, { buttonTextColor, defaultFont, white80 } from "../../Styles";
import { StyleSheet, Text, View } from "react-native";
import Button from "../Button";
import Checkbox from "../Checkbox";


type UseDefaultInitProps = {
  onNextFunc: (setDPin: boolean, setInitData: boolean) => void;
  onCancelFunc: () => void;
};

const UseDefaultInit: React.FC<UseDefaultInitProps> = props => {
  const { onNextFunc, onCancelFunc } = props;
  const [addDuress, setAddDuress] = React.useState<boolean>(false);
  const [addInitData, setAddInitData] = React.useState<boolean>(false);


  return (
    <View style={styles.initDataContainer}>
      <View style={styles.backBtnContainer}>
        <Button disabled={false} onChangeFunc={onCancelFunc} type="cancel"></Button>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>PUK and a pairing password</Text>
        <Text style={styles.prompt}>If neither PUK nor pairing password is set, a random 12-digits PUK and the default pairing password will be used. PUK and pairing password can be changed later from Settings menu.</Text>
        <Checkbox label="Yes, select PUK &amp; pairing password" onChangeFunc={setAddInitData} state={addInitData} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>Duress PIN</Text>
        <Text style={styles.prompt}>A duress PIN unlocks the card but shows a decoy account. Use it if you are ever forced to access your wallet under pressure.</Text>
        <Checkbox label="Yes, add duress PIN" onChangeFunc={setAddDuress} state={addDuress} />
      </View>
      <View>
        <Button label="Continue" disabled={false} onChangeFunc={() => onNextFunc(addDuress, addInitData)} type="secondary" />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  initDataContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    gap: 20,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  backBtnContainer: {
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    boxSizing: 'border-box',
    marginBottom: 10,
  },
  textContainer: {
    width: '85%',
    height: 220,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },

  heading: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    fontFamily: defaultFont,
  },
  prompt: {
    fontSize: 15,
    color: white80,
    fontWeight: '200',
    fontFamily: defaultFont,
    lineHeight: 20
  }
});

export default UseDefaultInit;

