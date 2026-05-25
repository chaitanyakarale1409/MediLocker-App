import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons'; // 👈 IMPORTED VECTOR ICONS

const { width } = Dimensions.get('window');

interface OnboardingTwoProps {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function OnboardingTwoScreen({ navigation }: OnboardingTwoProps) {
  // Cross-platform safe area insets
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Skip Button: Dynamically positioned below the notch/status bar */}
      <TouchableOpacity
        style={[styles.skip, { top: Math.max(insets.top + 15, 40) }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Onboarding3')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text allowFontScaling={false} style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Image Wrapper: Dynamically padded so the image doesn't hit the top */}
      <View style={[styles.imageWrapper, { paddingTop: Math.max(insets.top + 50, 80) }]}>
        <Image
          source={{
            uri: 'https://api.builder.io/api/v1/image/assets/TEMP/7ea70dcd9bbc2738e8f6bd2f588fb0d9079df6e9?width=784',
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Content: Dynamically padded to avoid the home indicator */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 20, 48) }]}>
        <Text allowFontScaling={false} style={styles.headline}>
          One Account, Multiple Family Profiles
        </Text>

        <View style={styles.actionRow}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Onboarding3')}
          >
            {/* 👈 REPLACED TEXT WITH A HIGH-QUALITY VECTOR ICON */}
            <Feather name="arrow-right" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  skip: {
    position: 'absolute',
    right: 24, // Adjusted slightly for safer edge clearance on all devices
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A1A8B0',
    lineHeight: 19.6,
  },
  imageWrapper: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'center', // Centers image vertically in the remaining space
  },
  image: {
    width: width - 36,
    height: undefined,
    aspectRatio: 392 / 562,
    maxHeight: 562,
  },
  bottom: {
    paddingHorizontal: 44,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#221F1F',
    lineHeight: 29.7,
    marginBottom: 28,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 13,
    height: 4,
    borderRadius: 56,
    backgroundColor: '#407CE2',
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    opacity: 0.3,
  },
  arrowButton: {
    width: 67,
    height: 65,
    borderRadius: 34,
    backgroundColor: '#32617D',
    alignItems: 'center',
    justifyContent: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    // Android shadow
    elevation: 8,
  },
  // arrowText style has been removed as we are using vector icons now
});
