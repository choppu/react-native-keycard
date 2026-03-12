import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const ChevronRight: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 20 20" fill="none" >
        <Path d="M7.74994 14.5L12.2502 9.99994L7.74988 5.50002" stroke={stroke} strokeOpacity="0.4" strokeWidth="1.2" />
      </Svg>
    </View>
  );
};

export default ChevronRight;
