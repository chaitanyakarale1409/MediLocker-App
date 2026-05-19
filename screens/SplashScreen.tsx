import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Replaces the Splash screen in the stack with Onboarding1
      navigation.replace('Onboarding1');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Image
        source={{
          uri: 'https://api.builder.io/api/v1/image/assets/TEMP/b07c0810b9008dce567a38879b44d06cca178a1e?width=856',
        }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});