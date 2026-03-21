import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import images from '../constants/images';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { tokenStorage } from '../api/tokenStorage';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';

const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const logoScale   = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotOpacity  = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 300,
        delay: 80,
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 340,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const isAuthenticated = tokenStorage.hasToken();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: isAuthenticated ? ROUTES.MAIN_TABS : ROUTES.LOGIN }],
        }),
      );
    });
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <Animated.View
        style={[
          styles.logoBlock,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
        <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Driver Partner
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.dotRow, { opacity: dotOpacity }]}>
        {[0, 1, 2].map(i => (
          <PulseDot key={i} delay={i * 180} />
        ))}
      </Animated.View>

      <Animated.Text style={[styles.watermark, { opacity: tagOpacity }]}>
        Intrastate Transport
      </Animated.Text>
    </Animated.View>
  );
};

const PulseDot = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ scale }] }]}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringOuter: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    opacity: 0.35,
  },
  ringInner: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    opacity: 0.5,
  },

  logoBlock: {
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 260,
    height: 100,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.tabBarInactive,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 56,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    opacity: 0.8,
  },

  watermark: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: colors.tabBarInactive,
    fontWeight: '500',
    letterSpacing: 1,
  },
});

export default SplashScreen;
