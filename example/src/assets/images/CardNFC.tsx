import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { View } from 'react-native';

type SvgProps = {
  width: string;
  heigth: string;
  stroke?: string;
  className?: string;
};

const  CardNFC: React.FC<SvgProps> = (props: SvgProps) => {
  const {width, heigth} = props;
    return (
      <View>
        <Svg width={width} height={heigth} viewBox="0 0 114 114" fill="none">
          <Circle cx="57" cy="57" r="54" stroke="#FF6400" strokeWidth="3" />
          <Path d="M68.9371 78.5076L68.9371 36C68.9371 31.5817 65.3554 28 60.9371 28L15.2474 28C13.4334 28 11.7472 28.9689 10.8617 30.5522C7.95224 35.7544 3.00001 45.5568 3.00001 57.2538C3.00001 68.9508 7.95223 78.7532 10.8617 83.9554C11.7471 85.5386 13.4334 86.5076 15.2474 86.5076L60.9371 86.5076C65.3554 86.5076 68.9371 82.9258 68.9371 78.5076Z" fill="#2A4AF5" fillOpacity="0.1" stroke="#FF6400" strokeWidth="3" />
          <Path d="M39.8058 62.8584L39.7574 50.4406C39.7522 49.0426 40.8805 47.9043 42.2788 47.8986L55.5081 47.8481C56.9064 47.8425 58.0437 48.9722 58.0488 50.3702L58.0971 62.7879C58.1029 64.1859 56.9739 65.3242 55.576 65.3281L42.3463 65.3803C40.9482 65.386 39.8107 64.2564 39.8058 62.8584Z" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M44.6469 52.3949C45.7434 52.3909 46.6352 53.276 46.64 54.372L46.658 59.0436C46.6619 60.1414 45.777 61.0323 44.6803 61.0381L39.7987 61.0563" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M39.7648 52.4128L44.6464 52.3946L39.7648 52.4128Z" fill="#FF6400" />
          <Path d="M39.7648 52.4128L44.6464 52.3946" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M58.0904 60.9786L53.3457 60.9983C52.2491 61.0023 51.3566 60.1172 51.3527 59.0194L51.334 54.3478C51.33 53.2518 52.2157 52.3591 53.3122 52.3551L58.0568 52.3372" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M58.0742 56.8531L51.4872 56.7733L58.0742 56.8531Z" fill="#FF6400" />
          <Path d="M58.0742 56.8531L51.4872 56.7733" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M46.4848 56.8582L39.8929 56.7472L46.4848 56.8582Z" fill="#FF6400" />
          <Path d="M46.4848 56.8582L39.8929 56.7472" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M46.6565 58.7442L46.6397 54.4108L51.3363 54.3922L51.353 58.7256L46.6565 58.7442Z" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M44.8449 61.0273L44.8735 65.369L44.8449 61.0273Z" fill="#FF6400" />
          <Path d="M44.8449 61.0273L44.8735 65.369" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M44.7579 47.8892L44.7876 52.399L44.7579 47.8892Z" fill="#FF6400" />
          <Path d="M44.7579 47.8892L44.7876 52.399" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M53.4626 60.9968L53.4915 65.3367L53.4626 60.9968Z" fill="#FF6400" />
          <Path d="M53.4626 60.9968L53.4915 65.3367" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M53.3766 47.8555L53.4065 52.3546L53.3766 47.8555Z" fill="#FF6400" />
          <Path d="M53.3766 47.8555L53.4065 52.3546" stroke="#FF6400" strokeWidth="1.05769" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M85.6171 45.6467C88.698 48.7276 90.4288 52.9061 90.4288 57.2632C90.4288 61.6202 88.698 65.7988 85.6171 68.8797" stroke="#FF6400" strokeWidth="3" strokeLinecap="round" />
          <Path d="M79.9702 50.2933C81.8186 52.1418 82.8571 54.6488 82.8571 57.2629C82.8571 59.8771 81.8186 62.3841 79.9702 64.2326" stroke="#FF6400" strokeWidth="3" strokeLinecap="round" />
          <Path d="M91.2633 41.0002C95.5765 45.3135 97.9997 51.1635 97.9997 57.2634C97.9997 63.3632 95.5767 69.2139 91.2634 73.5272" stroke="#FF6400" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      </View>
    );
};

export default CardNFC;
