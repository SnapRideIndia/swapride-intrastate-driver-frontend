import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isAxiosError } from 'axios';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import BaseLayout from '../layouts/BaseLayout';
import OtpInput from '../components/ui/OtpInput';
import Button from '../components/ui/Button';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useVerifyOtp } from '../features/auth/hooks/useVerifyOtp';
import { useSendOtp } from '../features/auth/hooks/useSendOtp';
import { useDriver } from '../context/DriverContext';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.OTP>;

const RESEND_COUNTDOWN = 30;

const formatPhone = (phone: string) =>
  `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

const OtpScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: sendOtp, isPending: isResending } = useSendOtp();

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0 || isResending) return;
    setOtp('');
    setError('');
    sendOtp(
      { mobileNumber: phone },
      { onSuccess: () => setCountdown(RESEND_COUNTDOWN) },
    );
  };

  const { refetch: refetchProfile } = useDriver();

  const handleVerify = useCallback(() => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    verifyOtp(
      { mobileNumber: phone, otp },
      {
        onSuccess: () => {
          // Activate the DriverProvider to fetch profile now that we have a token.
          refetchProfile();
          navigation.reset({ index: 0, routes: [{ name: ROUTES.MAIN_TABS }] });
        },
        onError: err => {
          if (isAxiosError(err) && err.response?.status === 401) {
            setError('Invalid or expired OTP. Please try again.');
          }
        },
      },
    );
  }, [otp, phone, verifyOtp, navigation, refetchProfile]);

  return (
    <BaseLayout>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft color={colors.textPrimary} size={22} strokeWidth={2} />
          </TouchableOpacity>

          {/* Icon + heading */}
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <ShieldCheck color={colors.primary} size={36} strokeWidth={1.75} />
            </View>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.phoneDisplay}>{formatPhone(phone)}</Text>
          </View>

          {/* OTP input */}
          <View style={styles.otpSection}>
            <OtpInput
              value={otp}
              onChange={val => {
                setOtp(val);
                if (error) setError('');
                if (val.length === 6) {
                  Keyboard.dismiss();
                }
              }}
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Resend row */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>
                {' '}Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={isResending}>
                <Text style={styles.resendLink}>
                  {isResending ? ' Sending…' : ' Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Verify button */}
          <Button
            mode="contained"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={isVerifying || otp.length < 6}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}>
            {isVerifying ? 'Verifying…' : 'Verify OTP'}
          </Button>

          <Text style={styles.secureNote}>
            Secured with end-to-end encryption
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  header: {
    marginBottom: 40,
    gap: 6,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 2,
  },
  phoneDisplay: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },

  otpSection: {
    gap: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginTop: 4,
  },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendCountdown: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  spacer: {
    flex: 1,
    minHeight: 40,
  },

  button: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secureNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OtpScreen;
