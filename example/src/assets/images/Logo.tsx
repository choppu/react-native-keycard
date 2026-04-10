import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const Logo: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 39 68" fill="none">
        <Path d="M31.1187 67.827L23.0354 56.1535L20.6105 58.9713L20.6105 67.827H13.3356L13.3356 26.9702H20.6105V49.9143H21.0148L29.9063 39.4487H38.3937L27.8854 51.5246L39 67.827H31.1187Z" fill={stroke} />
        <Path d="M16.7726 33.6112C7.47695 33.6112 0 25.9632 0 16.705C0 7.44681 7.47695 0 16.7726 0C26.0682 0 33.5453 7.44681 33.5453 16.705C33.7474 25.9632 26.0682 33.6112 16.7726 33.6112ZM16.7726 6.64175C11.1144 6.64175 6.66862 11.2708 6.66862 16.705C6.66862 22.3405 11.3165 26.7684 16.7726 26.7684C22.4309 26.7684 26.8765 22.1392 26.8765 16.705C27.0786 11.2708 22.4309 6.64175 16.7726 6.64175Z" fill={stroke} />
      </Svg>
    </View>
  );
};

export default Logo;
