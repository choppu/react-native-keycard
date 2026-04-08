import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const RemoveKey: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View>
      <Svg width={width} height={heigth} viewBox="0 0 30 30" fill="none">
        <Path d="M21.4255 11.4238L16.8493 15.999L21.4255 20.5762L20.5778 21.4238L16.0007 16.8467L11.4245 21.4238L10.5768 20.5762L15.152 15.999L10.5768 11.4238L11.4255 10.5752L16.0007 15.1504L20.5768 10.5752L21.4255 11.4238Z" fill={stroke} />
      </Svg>
    </View>
  );
};

export default RemoveKey;
