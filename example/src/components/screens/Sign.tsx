import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Styles, { backgroundColorTransparent, buttonTextColor, defaultFont, logBgColor, logFont, neutral90, pVertical } from "../../Styles";
import Button from "../Button";
import { ethPath, paths, type SignData } from "../../Main";
import Dialpad from "../Dialpad";
import ChevronBottom from "../../assets/images/ChevronBottom";
import { SelectList } from 'react-native-dropdown-select-list'

type SignScreenProps = {
  signResponse: SignData | undefined;
  onSubmitFunc: (pin: string, message: string, path: string) => void;
  onCancelFunc: () => void;
};

enum SignSteps {
  SignMessage,
  SignSuccess,
  VerifyPin
}

const SignScreen: React.FC<SignScreenProps> = props => {
  const { signResponse, onSubmitFunc, onCancelFunc } = props;
  const [step, setStep] = React.useState<number>(SignSteps.SignMessage);
  const [path, setPath] = React.useState<string>(ethPath);
  const [message, setMessage] = React.useState<string>('');

  const insertPin = (p: string) => {
    onSubmitFunc(p, message, path);
    setStep(SignSteps.SignSuccess);
    return true;
  }

  const signMessage = () => {
    setStep(SignSteps.VerifyPin);
  }

  const closeSign = () => {
    setStep(SignSteps.VerifyPin);
    onCancelFunc();
  }

  return (
    <View style={Styles.container}>
      {step == SignSteps.SignMessage && (
        <View style={styles.container}>
          <View style={styles.backBtnContainer}>
            <Button disabled={false} onChangeFunc={onCancelFunc} type="cancel" />
          </View>
          <Text style={Styles.heading}>Sign personal message</Text>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account</Text>
              <SelectList
                setSelected={(val: string) => setPath(val)}
                data={paths}
                defaultOption={paths[0]}
                dropdownStyles={styles.dropdownList}
                dropdownTextStyles={styles.dropdownItemStyles}
                inputStyles={styles.selectedItem}
                boxStyles={styles.selectorStyle}
                search={false}
                placeholder={'Select an Ethereum account'}
                fontFamily={defaultFont}
                arrowicon={<ChevronBottom width="20" heigth="20" stroke={buttonTextColor} />}
                maxHeight={120}
                save="value"
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Message</Text>
              <TextInput style={styles.messageInput} multiline={true} numberOfLines={10} onChangeText={setMessage} value={message} submitBehavior={'blurAndSubmit'} />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button label={'Sign'} disabled={message == ''} onChangeFunc={signMessage} type="secondary" />
          </View>
        </View>
      )}
      {step == SignSteps.VerifyPin && (<Dialpad pinRetryCounter={-1} prompt={"Enter PIN"} onCancelFunc={() => setStep(SignSteps.SignMessage)} onNextFunc={insertPin} type='pin' />)}
      {step == SignSteps.SignSuccess && (
        <View style={styles.successContainer}>
          <View style={styles.backBtnContainer}>
            <Button disabled={false} onChangeFunc={onCancelFunc} type="remove" />
          </View>
          {signResponse != undefined && (
            <View>
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    paddingVertical: pVertical
  },
  successContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    paddingVertical: pVertical
  },
  formContainer: {
    minHeight: '58%'
  },
  fieldContainer: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
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
    paddingVertical: 12,
    paddingTop: 13,
    paddingHorizontal: 10,
    backgroundColor: backgroundColorTransparent,
    borderColor: logBgColor,
    borderRadius: 6,
    borderWidth: 1,
    boxSizing: 'border-box'
  },
  selectedItem: {
    color: 'white',
    fontSize: 13,
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
    fontSize: 13,
    fontFamily: defaultFont,
    fontWeight: '300',
    paddingVertical: 3,
    boxSizing: 'border-box'
  },
  messageInput: {
    color: 'white',
    fontSize: 16,
    fontFamily: defaultFont,
    fontWeight: '300',
    backgroundColor: neutral90,
    borderColor: logBgColor,
    borderRadius: 6,
    height: 180,
    textAlignVertical: 'top',
    padding: 8,
    boxSizing: 'border-box'
  },
  buttonContainer: {
    paddingTop: 50
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
