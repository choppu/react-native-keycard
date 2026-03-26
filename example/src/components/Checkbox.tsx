import React from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { backgroundColor, defaultFont, secondaryColor } from "../Styles";
import Check from "../assets/images/CheckIcon";

type CheckboxProps = {
  label?: string;
  state: boolean;
  color?: string;
  onChangeFunc: (val: boolean) => void;
  size?: number;
  checkBgColor?: string
};

const Checkbox: React.FC<CheckboxProps> = props => {
  const { label, state, color = secondaryColor, onChangeFunc, size = 22, checkBgColor = backgroundColor} = props;

  return (
    <BouncyCheckbox
    size={size} fillColor={color}
    unFillColor="transparent"
    text={label}
    iconStyle={{ borderColor: color }}
    innerIconStyle={{ borderWidth: 1 }}
    textStyle={{ fontFamily: defaultFont, textDecorationLine: "none"}}
    onPress={(checked: boolean) => onChangeFunc(checked)}
    isChecked={state}
    iconComponent={<Check width="25" heigth="25" stroke={checkBgColor}/>}
/>
  )
};

export default Checkbox;

