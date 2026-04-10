import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const ChevronBottom: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 20 20" fill="none" >
        <Path d="M 5.7122009,7.5377497 10.212261,12.03801 14.712181,7.5376897" stroke={stroke} strokeOpacity="0.4" strokeWidth="1.2" />
      </Svg>
    </View>
  );
};

export default ChevronBottom;
