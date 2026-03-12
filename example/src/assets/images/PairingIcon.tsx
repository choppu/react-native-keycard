import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { View } from 'react-native';
import Styles from '../../Styles';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
  className?: string;
};

const PairingIcon: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View style={Styles.tabIcon}>
      <Svg width={width} height={heigth} viewBox="0 0 21 21">
        <G fill="none" fill-rule="evenodd" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" transform="translate(4 5)">
          <Path d="m5.5 2.5 1-1c1.1045695-1.1045695 2.8954305-1.1045695 4 0s1.1045695 2.8954305 0 4l-1 1m-3 3-1 1c-1.1045695 1.1045695-2.8954305 1.1045695-4 0s-1.1045695-2.8954305 0-4l1-1" />
          <Path d="m3.5 8.5 5-5" />
        </G>
      </Svg>
    </View>
  );
};

export default PairingIcon;
