import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAxiosError } from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useSendOtp } from '../features/auth/hooks/useSendOtp';
import images from '../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.LOGIN>;

const LoginScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { mutate: sendOtp, isPending } = useSendOtp();

  const handleGetOtp = () => {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    sendOtp(
      { mobileNumber: phone },
      {
        onSuccess: () => navigation.navigate(ROUTES.OTP, { phone }),
        onError: err => {
          if (isAxiosError(err) && err.response?.status === 404) {
            setError('This number is not registered as a driver.');
          }
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View style={[styles.topSection, { paddingTop: insets.top + 32 }]}>
        <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Driver Partner</Text>
      </View>

      <View style={[styles.card, { paddingBottom: insets.bottom + 24 }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}>

          <Text style={styles.formTitle}>Let's get started</Text>
          <Text style={styles.formSubtitle}>
            Enter your mobile number to receive an OTP
          </Text>

          <Input
            label="Mobile Number"
            value={phone}
            onChangeText={text => {
              const formatted = text.replace(/\D/g, '');
              setPhone(formatted);
              if (error) setError('');
              if (formatted.length === 10) {
                Keyboard.dismiss();
              }
            }}
            keyboardType="number-pad"
            placeholder="9876543210"
            maxLength={10}
            error={error}
            containerStyle={styles.inputContainer}
            returnKeyType="done"
            onSubmitEditing={handleGetOtp}
            prefix={
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>+91</Text>
                <View style={styles.prefixDivider} />
              </View>
            }
          />

          <Button
            mode="contained"
            onPress={handleGetOtp}
            loading={isPending}
            disabled={isPending}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}>
            {isPending ? 'Sending…' : 'Get OTP'}
          </Button>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  logo: {
    width: 240,
    height: 90,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.tabBarInactive,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  cardScroll: {
    gap: 0,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 6,
  },
  inputContainer: {
    marginTop: 24,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 10,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  button: {
    borderRadius: 12,
    marginTop: 20,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  terms: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
