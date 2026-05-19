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

const { width } = Dimensions.get('window');

interface OnboardingTwoProps {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function OnboardingTwoScreen({ navigation }: OnboardingTwoProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity
        style={styles.skip}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Onboarding3')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: 'https://api.builder.io/api/v1/image/assets/TEMP/7ea70dcd9bbc2738e8f6bd2f588fb0d9079df6e9?width=784',
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.headline}>
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
            <Text style={styles.arrowText}>{'→'}</Text>
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
    top: 75,
    right: 36,
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
    paddingTop: 127,
    paddingHorizontal: 18,
  },
  image: {
    width: width - 36,
    height: undefined,
    aspectRatio: 392 / 562,
    maxHeight: 562,
  },
  bottom: {
    paddingHorizontal: 44,
    paddingBottom: 48,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 8,
  },
  arrowText: {
    color: '#FFF',
    fontSize: 26,
  },
});