import React from "react";
import { Modal, Platform, Text, View } from "react-native";
import Styles from "./Styles";
import Button from "./components/Button";
import CardNFC from "./assets/images/CardNFC";

type NFCModalProps = {
  isVisible: boolean;
  modalHeader: string;
  modalPrompt: string;
  onChangeFunc: () => void;
};

const NFCModal: React.FC<NFCModalProps> = (props) => {
  const { isVisible, modalHeader, modalPrompt, onChangeFunc } = props;

  return (
    <Modal visible={Platform.OS === 'android' && isVisible} transparent animationType="slide" onRequestClose={() => onChangeFunc()}>
      <View style={Styles.modalContainer}>
        <View style={Styles.modalContent}>
          <Text style={Styles.modalHeader}>{modalHeader}</Text>
          <View style={Styles.modalIconContainer}>
            <CardNFC width="100" heigth="100" className='modalIcon' />
          </View>
          <Text style={Styles.modalPrompt}>{modalPrompt}</Text>
          <View style={Styles.footer}>
            <Button label="Cancel" disabled={false} onChangeFunc={() => onChangeFunc()} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NFCModal;
