import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Styles, { backgroundColorTransparent, buttonTextColor, defaultFont, logBgColor, logFont, neutral90 } from "../../Styles";
import Button from "../Button";
import { ethPath, type SignData, type Wallet } from "../../Main";
import Dialpad from "../Dialpad";
import ChevronBottom from "../../assets/images/ChevronBottom";
import { SelectList } from 'react-native-dropdown-select-list'

type SignScreenProps = {
  addresses: Wallet[];
  signResponse: SignData | undefined;
  getAddressesFunc: (pin: string) => void;
  onSubmitFunc: (pin: string, message: string, path: string) => void;
  onCancelFunc: () => void;
};

enum SignSteps {
  VerifyPin,
  SignMessage,
  SignSuccess
}

const SignScreen: React.FC<SignScreenProps> = props => {
  const { addresses, signResponse, onSubmitFunc, getAddressesFunc, onCancelFunc } = props;
  const [pin, setCurrentPin] = React.useState('');
  const [step, setStep] = React.useState<number>(SignSteps.VerifyPin);
  const [childIndex, setChildIndex] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string>('');


  const insertPin = (p: string) => {
    setCurrentPin(p);
    getAddressesFunc(p);
    setStep(SignSteps.SignMessage);
    return true;
  }

  const signTransaction = () => {
    const accountPath = `${ethPath}/${childIndex}`;
    onSubmitFunc(pin, message, accountPath);
    setStep(SignSteps.SignSuccess);
  }

  const closeSign = () => {
    setStep(SignSteps.VerifyPin);
    onCancelFunc();
  }

  return (
    <View style={Styles.container}>
      {step == SignSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={onCancelFunc} onNextFunc={insertPin} type='pin' />)}
      {step == SignSteps.SignMessage && (
        <View style={styles.container}>
          <View style={styles.backBtnContainer}>
            <Button disabled={false} onChangeFunc={() => setStep(SignSteps.VerifyPin)} type="cancel" />
          </View>
          <Text style={Styles.heading}>Sign personal message</Text>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account</Text>
              <SelectList
                setSelected={(val: number) => setChildIndex(val)}
                data={addresses.map((address) => {
                  return { value: `0x${address.address}`, key: address.index }
                })}
                dropdownStyles={styles.dropdownList}
                dropdownTextStyles={styles.dropdownItemStyles}
                inputStyles={styles.selectedItem}
                boxStyles={styles.selectorStyle}
                search={false}
                placeholder={'Select an Ethereum account'}
                fontFamily={defaultFont}
                arrowicon={<ChevronBottom width="20" heigth="20" stroke={buttonTextColor} />}
                maxHeight={120}
                save="key"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={Styles.heading}>Sign personal message</Text>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput style={styles.messageInput} multiline={true} numberOfLines={10} onChangeText={setMessage} value={message} />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button label={'Sign'} disabled={message == ''} onChangeFunc={signTransaction} type="secondary" />
          </View>
        </View>
      )}
      {step == SignSteps.SignSuccess && signResponse != undefined && (
        <View style={styles.successContainer}>
          <Text style={Styles.heading}>Sign response data</Text>
          <View style={styles.textContainer}>
            <Text style={styles.signDataLabel}>Signer account</Text>
            <Text style={styles.signData}>{signResponse?.account}</Text>
            <Text style={styles.signDataLabel}>Message</Text>
            <Text style={styles.signData}>{message}</Text>
            <Text style={styles.signDataLabel}>R</Text>
            <Text style={styles.signData}>0x{signResponse?.r}</Text>
            <Text style={styles.signDataLabel}>S</Text>
            <Text style={styles.signData}>0x{signResponse?.s}</Text>
            <Text style={styles.signDataLabel}>Public key</Text>
            <Text style={styles.signData}>0x{signResponse?.publicKey}</Text>
            <Text style={styles.signDataLabel}>Recovery ID</Text>
            <Text style={styles.signData}>{signResponse?.recId}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button label={'OK'} disabled={false} onChangeFunc={closeSign} type="secondary" />
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
    marginBottom: 0,
  },
  container: {
    width: '100%',
    height: '95%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    marginBottom: 20
  },
  successContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  formContainer: {
    minHeight: '58%'
  },
  fieldContainer: {
    width: '100%',
    paddingLeft: 25,
    paddingRight: 25,
    marginVertical: 5,
    boxSizing: 'border-box'
  },
  fieldLabel: {
    color: buttonTextColor,
    fontSize: 16,
    fontFamily: defaultFont,
    fontWeight: '300',
    paddingVertical: 10,
    paddingHorizontal: 5,
    boxSizing: 'border-box'
  },
  selectorStyle: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: backgroundColorTransparent,
    borderColor: logBgColor,
    borderRadius: 6,
    borderWidth: 1,
    boxSizing: 'border-box'
  },
  selectedItem: {
    color: 'white',
    fontSize: 12,
    fontFamily: defaultFont,
    fontWeight: '300',
  },
  dropdownList: {
    borderColor: logBgColor,
    borderRadius: 12,
    backgroundColor: neutral90
  },
  dropdownItemStyles: {
    color: buttonTextColor,
    fontSize: 12,
    fontFamily: defaultFont,
    fontWeight: '300',
    paddingVertical: 3,
    boxSizing: 'border-box'
  },
  messageInput: {
    color: 'white',
    fontSize: 14,
    fontFamily: defaultFont,
    fontWeight: '300',
    backgroundColor: neutral90,
    borderColor: logBgColor,
    borderRadius: 6,
    height: 180,
    textAlignVertical: 'top',
    paddingHorizontal: 8,
    boxSizing: 'border-box'
  },
  buttonContainer: {
    paddingTop: 30
  },
  textContainer: {
    paddingHorizontal: 30,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 6
  },
  signDataLabel: {
    color: buttonTextColor,
    fontSize: 14,
    fontFamily: defaultFont,
    fontWeight: '300',
    paddingVertical: 1,
    boxSizing: 'border-box'
  },
  signData: {
    color: 'white',
    fontSize: 16,
    fontFamily: logFont,
    paddingVertical: 1,
    boxSizing: 'border-box',
    borderBottomWidth: 1,
    borderBottomColor: logBgColor,
    paddingBottom: 4
  }
});

export default SignScreen;
