import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import CancelKey from "../assets/images/CancelKey";
import { buttonTextColor, defaultFont } from "../Styles";

type DialpadKeypadProps = {
  dialPadContent: any[];
  dialPadSize: number;
  dialPadTextSize: number;
  updateCodeFunc: (item: never) => void;
};

const DialpadKeypad: React.FC<DialpadKeypadProps> = props => {
  const { dialPadContent, dialPadSize, dialPadTextSize, updateCodeFunc } = props;

  return (
    <FlatList data={dialPadContent} numColumns={3} keyExtractor={(_, index) => index.toString()} renderItem={({ item }) => {
      return (
        <TouchableOpacity disabled={item === ""} onPress={() => updateCodeFunc(item as never)}>
          <View style={[
            {
              borderWidth: item === "" || item === "X" ? 0 : 1,
              width: dialPadSize,
              height: dialPadSize,
            },
            styles.dialPadContainer,
          ]}
          >
            {item === "X" ? (
              <Text style={[{ fontSize: dialPadTextSize }, styles.dialPadText]}>
                <CancelKey width="60" heigth="60" stroke={buttonTextColor} />
              </Text>
            ) : (
              <Text
                style={[{ fontSize: dialPadTextSize }, styles.dialPadText]}
              >
                {item}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }}
    />
  )
};

const styles = StyleSheet.create({
  dialPadContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
    width: 110
  },
  dialPadText: {
    color: buttonTextColor,
    fontFamily: defaultFont
  }
});

export default DialpadKeypad;
