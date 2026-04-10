import type { FC, ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type IconButtonProps = {
  id: number;
  icon: ReactNode;
  disabled: boolean;
  onChangeFunc: () => void;
};

const  IconButton: FC<IconButtonProps> = props => {
  const {id, icon, disabled, onChangeFunc} = props;

  return (
    <TouchableOpacity key={id} disabled={disabled} onPress={onChangeFunc} style={style.iconButtonContainer}>
      <View>
        {icon}
      </View>
    </TouchableOpacity>
  )};

const style = StyleSheet.create({
  iconButtonContainer: {
    flexGrow: 1,
    margin: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default IconButton;
