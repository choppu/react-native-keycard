import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const BackKey: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 20 20" fill="none">
        <Path d="M8.94385 4.90332L4.85596 9.40039H15.9995V10.5996H4.85596L8.94385 15.0967L8.05518 15.9033L3.05518 10.4033L2.68896 10L3.05518 9.59668L8.05518 4.09668L8.94385 4.90332Z" fill={stroke} />
      </Svg>
    </View>
  );
};

export default BackKey;
