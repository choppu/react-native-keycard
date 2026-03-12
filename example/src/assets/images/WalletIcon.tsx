import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { View } from 'react-native';
import Styles from '../../Styles';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
};

const WalletIcon: React.FC<SvgProps> = (props: SvgProps) => {
  const { width, heigth, stroke } = props;
  return (
    <View style={Styles.tabIcon}>
      <Svg width={width} height={heigth} viewBox="0 0 21 21">
        <G fill="none" fill-rule="evenodd" transform="translate(3 4)">
          <Path d="m.5 2.5h12c1.1045695 0 2 .8954305 2 2v6c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2zm1-2h9c.5522847 0 1 .44771525 1 1v1h-11v-1c0-.55228475.44771525-1 1-1z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="11.5" cy="7.5" fill={stroke} r="1" />
        </G>
      </Svg>
    </View>
  );
};

export default WalletIcon;
