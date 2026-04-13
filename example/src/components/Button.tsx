import type { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { backgroundColorTransparent, buttonTextColor, defaultFont, neutral90, secondaryColor } from "../Styles";
import BackKey from "../assets/images/BackKey";
import { BlurView } from '@sbaiahmed1/react-native-blur';
import ChevronRight from "../assets/images/ChevronRight";
import RemoveKey from "../assets/images/RemoveKey";
import QRIcon from "../assets/images/QRIcon";


type ButtonProps = {
  disabled: boolean;
  label?: string;
  key?: string;
  type?: string;
  onChangeFunc: () => void;
};

const Button: FC<ButtonProps> = props => {
  const { label, disabled, type = "primary", onChangeFunc } = props;

  const textContainer = () => {
    if (type == 'cancel' || type == 'remove') {
      return style.cancelBtnContainer;
    } else if (type == 'secondary') {
      return style.secondaryBtnContainer;
    } else if (type == 'menu' || type == 'address') {
      return style.secondaryBtnContainer;
    } else {
      return style.primarytBtnContainer;
    }
  }

  return (

    <TouchableOpacity key={label} disabled={disabled} onPress={onChangeFunc} style={[textContainer(), disabled ? style.disabledBtn : null]}>
      <View style={style.button}>
        {type == "cancel" && <BackKey width="20" heigth="20" stroke="white" />}
        {type == "remove" && <RemoveKey width="30" heigth="30" stroke="white" />}
        {type == "primary" && <BlurView blurType='dark' blurAmount={40} style={style.bluredButton} overlayColor={neutral90} reducedTransparencyFallbackColor={backgroundColorTransparent}><Text style={style.primaryText}>{label}</Text></BlurView>}
        {type == "secondary" && <View style={style.secondaryButton}><Text style={style.secondaryText}>{label}</Text></View>}
        {type == "menu" && <View style={style.menuButton}><Text style={style.secondaryText}>{label}</Text><ChevronRight width="20" heigth="20" stroke="white" /></View>}
        {type == "address" && <View style={style.menuButton}>
          <Text style={style.secondaryText}>{label}</Text>
          <View style={style.iconContainer}>
            <QRIcon width="18" heigth="18" stroke="white" />
          </View>
          </View>}
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
    justifyContent: 'center',
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
    boxSizing: 'border-box'
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: secondaryColor
  },
  menuButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 2,
    paddingRight: 2,
    gap: 2
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
    lineHeight: 22,
    fontWeight: '200',
  },
  iconContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 8,
    boxSizing: 'border-box'
  }
});

export default Button;
