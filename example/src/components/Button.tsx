import type { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { backgroundColorTransparent, buttonTextColor, defaultFont, neutral90, neutralSolid } from "../Styles";
import BackKey from "../assets/images/BackKey";
import { BlurView } from '@sbaiahmed1/react-native-blur';
import ChevronRight from "../assets/images/ChevronRight";


type ButtonProps = {
  label?: string;
  disabled: boolean;
  type?: string;
  onChangeFunc: () => void;
};

const Button: FC<ButtonProps> = props => {
  const { label, disabled, type = "primary", onChangeFunc } = props;

  const textContainer = () => {
    if (type == 'cancel') {
      return style.cancelBtnContainer;
    } else if (type == 'secondary') {
      return style.secondaryBtnContainer;
    } else {
      return style.primarytBtnContainer;
    }
  }

  return (

      <TouchableOpacity key={label} disabled={disabled} onPress={onChangeFunc} style={[textContainer(), disabled ? style.disabledBtn : null]}>
        <View style={style.button}>
          {type == "cancel" && <BackKey width="20" heigth="20" stroke="white" />}
        {type == "primary" && <BlurView blurType='dark' blurAmount={60} style={style.bluredButton}><Text style={style.primaryText}>{label}</Text></BlurView>}
        {type == "secondary" && <View style={style.secondaryButton}><Text style={style.secondaryText}>{label}</Text><ChevronRight width="20" heigth="20" stroke="white"/></View>}
        </View>
      </TouchableOpacity>
  )
};

const style = StyleSheet.create({
  primarytBtnContainer: {
    flexDirection: 'row',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginLeft: '5%',
    marginRight: '5%',
    height: 50,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    borderRadius: 12,
    boxSizing: 'border-box',
  },
  cancelBtnContainer: {
    width: 25,
    height: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    height: 50,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
    paddingLeft: '5%',
    paddingRight: '5%',
    boxSizing: 'border-box',
    borderBottomWidth: 1,
    borderColor: backgroundColorTransparent
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  bluredButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  secondaryButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 2,
    paddingRight: 2
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryText: {
    color: 'white',
    fontFamily: defaultFont,
    fontSize: 15,
    fontWeight: '200'
  },
  secondaryText: {
    color: buttonTextColor,
    fontFamily: defaultFont,
    fontSize: 15,
    fontWeight: '200',
  },
  cancelIcon: {
    color: 'white',
    textAlign: 'center'
  }
});

export default Button;
