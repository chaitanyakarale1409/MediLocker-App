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

interface OnboardingOneProps {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function OnboardingOneScreen({ navigation }: OnboardingOneProps) {
  // Cross-platform safe area insets
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skip, { top: Math.max(insets.top + 15, 40) }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Onboarding3')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text allowFontScaling={false} style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Image Wrapper */}
      <View style={[styles.imageWrapper, { paddingTop: Math.max(insets.top + 50, 80) }]}>
        <Image
          source={{
            uri: 'https://api.builder.io/api/v1/image/assets/TEMP/0a99536dc35485161aebde99dfa728e196bc3897?width=704',
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Content */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 20, 48) }]}>
        <Text allowFontScaling={false} style={styles.headline}>Organise All Your Records Digitally</Text>
        <Text allowFontScaling={false} style={styles.subtext}>
          {'Upload, store, and find \nyour medical reports easily\nall in one safe place.'}
        </Text>

        <View style={styles.actionRow}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotInactive]} />
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Onboarding2')}
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
    right: 24,
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
    paddingLeft: 20,
    justifyContent: 'center',
  },
  image: {
    width: width - 56,
    height: undefined,
    aspectRatio: 352 / 541,
    maxHeight: 541,
  },
  bottom: {
    paddingHorizontal: 44,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1C30',
    lineHeight: 29.7,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    fontWeight: '300',
    color: '#41484D',
    lineHeight: 21.6,
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
    backgroundColor: '#32617D', // Your blue/green circle background
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  // 👈 arrowText style has been completely removed as it's no longer needed
});