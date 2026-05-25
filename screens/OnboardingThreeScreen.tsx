import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface OnboardingThreeProps {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function OnboardingThreeScreen({ navigation }: OnboardingThreeProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={[styles.content, { marginTop: insets.top }]}>
        <Svg width={141} height={122} viewBox="0 0 141 122">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#407CE2" />
              <Stop offset="1" stopColor="#223A6A" />
            </LinearGradient>
          </Defs>
          <Path
            d="M140.289 46.4069C140.289 24.0886 125.601 0 101.874 0C85.2123 0 75.1128 9.56139 70.1444 16.1234C65.1761 9.55981 55.0766 0 38.4153 0C14.6876 0 0 24.0886 0 46.4069C0 72.783 21.8723 94.8023 45.5083 114.67C46.2821 115.322 47.2039 115.637 48.1182 115.637C49.3714 115.637 50.6113 115.044 51.4458 113.909C52.8883 111.948 52.5702 109.105 50.7341 107.562C28.776 89.1057 8.45717 68.923 8.45717 46.4069C8.45717 31.3387 17.9781 9.04251 38.4153 9.04251C57.9159 9.04251 66.0372 25.5076 66.3642 26.1926C67.0788 27.7144 68.5376 28.6683 70.1296 28.6762C70.1356 28.6762 70.1415 28.6762 70.1489 28.6762C71.735 28.6762 73.1909 27.7192 73.9159 26.21C74.2517 25.5092 82.3745 9.04409 101.875 9.04409C122.312 9.04409 131.833 31.3403 131.833 46.4085C131.833 63.9841 119.887 81.691 91.9191 105.56C84.3053 111.628 77.2167 113.871 72.4955 111.571C68.1678 109.461 65.6851 103.369 65.6851 94.8545V75.969C65.6851 73.4727 63.7912 71.4478 61.4565 71.4478H48.0221V61.9117H61.4565C63.7912 61.9117 65.6851 59.8868 65.6851 57.3905V43.0247H74.6053V57.3905C74.6053 59.8868 76.4977 61.9117 78.8339 61.9117H92.2683V71.4478H78.8339C76.4991 71.4478 74.6053 73.4727 74.6053 75.969V94.8545C74.6053 97.3509 76.4977 99.3758 78.8339 99.3758C81.1686 99.3758 83.0625 97.3509 83.0625 94.8545V80.4887H96.4969C98.8316 80.4887 100.725 78.4638 100.725 75.9675V57.3889C100.725 54.8925 98.8316 52.8676 96.4969 52.8676H83.0625V38.5018C83.0625 36.0055 81.1686 33.9806 78.8339 33.9806H61.4565C59.1217 33.9806 57.2279 36.0055 57.2279 38.5018V52.8676H43.7935C41.4587 52.8676 39.5649 54.8925 39.5649 57.3889V75.9675C39.5649 78.4638 41.4587 80.4887 43.7935 80.4887H57.2279V94.8545C57.2279 107.063 61.5142 116.154 68.986 119.797C71.374 120.962 73.9499 121.537 76.6723 121.537C82.7651 121.537 89.5933 118.647 96.6833 113.039C96.7336 113.001 96.7883 112.976 96.8372 112.933C96.9304 112.854 97.0236 112.773 97.1168 112.693C98.2724 111.763 99.4338 110.764 100.601 109.69C121.675 91.3188 140.289 70.9163 140.289 46.4069Z"
            fill="url(#grad)"
          />
        </Svg>

        <Text allowFontScaling={false} style={styles.brandName}>Armedico</Text>

        <View style={styles.textBlock}>
          <Text allowFontScaling={false} style={styles.headline}>Your Data, Fully Encrypted & Private</Text>
          <Text allowFontScaling={false} style={styles.subtext}>Your medical records, organized and secure</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { marginBottom: Math.max(insets.bottom, 20) }]}
        activeOpacity={0.85}
        onPress={() => navigation.replace('Login')}
      >
        <Text allowFontScaling={false} style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed to space-between for better dynamic spacing
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  brandName: {
    fontSize: 25,
    fontWeight: '600',
    color: '#223A6A',
    textAlign: 'center',
    marginTop: 24,
  },
  textBlock: {
    marginTop: 16,
    alignItems: 'center',
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#221F1F',
    lineHeight: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtext: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(34,31,31,0.6)',
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 12,
  },
  button: {
    width: '90%',
    maxWidth: 400,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#32617D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20, // Reduced slightly to ensure it fits better on all devices
    fontWeight: '700',
    color: '#FFF',
  },
});