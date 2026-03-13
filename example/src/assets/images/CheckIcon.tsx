import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const Check: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 21 21">
        <Path d="m.5 5.5 3 3 8.028-8" fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" transform="translate(5 6)"/>
      </Svg>
    </View>
  );
};

export default Check;
