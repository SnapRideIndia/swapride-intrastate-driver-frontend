import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import {
  User,
  FileCheck,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  AlertCircle,
  Headphones,
  Info,
  Star,
  Shield,
  FileText,
  LogOut,
  ShieldCheck,
} from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import BaseLayout from '../layouts/BaseLayout';
import DriverProfileCard from '../features/settings/components/DriverProfileCard';
import DriverProfileCardSkeleton from '../features/settings/components/DriverProfileCardSkeleton';
import SettingsSection from '../features/settings/components/SettingsSection';
import SettingsRow from '../features/settings/components/SettingsRow';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { useDriver } from '../context/DriverContext';
import { modal } from '../lib/modal';
import { tokenStorage } from '../api/tokenStorage';
import { APP_CONFIG } from '../config/app';

import { useQueryClient } from '@tanstack/react-query';
import { profileStorage } from '../storage/profileStorage';

const ICON_SIZE = 18;
const ICON_STROKE = 1.75;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { driver, isLoading, isError, refetch } = useDriver();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    modal.confirm(
      'Log Out',
      'Are you sure you want to log out of your account?',
      () => {
        tokenStorage.clearAll();
        profileStorage.clear();
        queryClient.clear();
        
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.LOGIN }],
          }),
        );
      },
    );
  };

  return (
    <BaseLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}>

        <View style={styles.heading}>
          <Text style={styles.headingTitle}>Profile & Settings</Text>
          <Text style={styles.headingSubtitle}>Manage your profile & preferences</Text>
        </View>

        {isLoading && !driver ? (
          <DriverProfileCardSkeleton />
        ) : driver ? (
          <DriverProfileCard
            profile={driver}
            onEditPress={() => navigation.navigate(ROUTES.PROFILE_DETAIL)}
          />
        ) : null}

        {!driver && isError ? (
          <TouchableOpacity
            style={styles.profileRetry}
            onPress={() => refetch()}
            activeOpacity={0.8}>
            <Text style={styles.profileRetryTitle}>Couldn’t load profile</Text>
            <Text style={styles.profileRetrySub}>Check your connection and tap to retry</Text>
          </TouchableOpacity>
        ) : null}

        <SettingsSection title="Account">
          <SettingsRow
            icon={<User size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />}
            iconBg={colors.primaryTint}
            label="My Profile"
            onPress={() => navigation.navigate(ROUTES.PROFILE_DETAIL)}
          />
          <SettingsRow
            icon={<ShieldCheck size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />}
            iconBg={colors.primaryTint}
            label="App Permissions"
            onPress={() => navigation.navigate(ROUTES.PERMISSIONS)}
          />
          <SettingsRow
            icon={<FileCheck size={ICON_SIZE} color={colors.success} strokeWidth={ICON_STROKE} />}
            iconBg={colors.successTint}
            label="Documents & KYC"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<CreditCard size={ICON_SIZE} color={colors.warning} strokeWidth={ICON_STROKE} />}
            iconBg={colors.warningTint}
            label="Bank Account"
            disabled
            onPress={() => {}}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon={<Bell size={ICON_SIZE} color={colors.orange} strokeWidth={ICON_STROKE} />}
            iconBg={colors.orangeTint}
            label="Notifications"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Globe size={ICON_SIZE} color={colors.purple} strokeWidth={ICON_STROKE} />}
            iconBg={colors.purpleTint}
            label="Language"
            value="English"
            disabled
            onPress={() => {}}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            icon={<HelpCircle size={ICON_SIZE} color={colors.teal} strokeWidth={ICON_STROKE} />}
            iconBg={colors.tealTint}
            label="Help & FAQ"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<AlertCircle size={ICON_SIZE} color={colors.rose} strokeWidth={ICON_STROKE} />}
            iconBg={colors.roseTint}
            label="Report an Issue"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Headphones size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />}
            iconBg={colors.primaryTint}
            label="Contact Support"
            disabled
            onPress={() => {}}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow
            icon={<Info size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />}
            iconBg={colors.slateTint}
            label="App Version"
            value={`v${APP_CONFIG.APP_VERSION}`}
            showChevron={false}
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Star size={ICON_SIZE} color={colors.warning} strokeWidth={ICON_STROKE} />}
            iconBg={colors.yellowTint}
            label="Rate the App"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Shield size={ICON_SIZE} color={colors.indigo} strokeWidth={ICON_STROKE} />}
            iconBg={colors.indigoTint}
            label="Privacy Policy"
            disabled
            onPress={() => {}}
          />
          <SettingsRow
            icon={<FileText size={ICON_SIZE} color={colors.slate} strokeWidth={ICON_STROKE} />}
            iconBg={colors.slateTint}
            label="Terms of Service"
            disabled
            onPress={() => {}}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Account Actions">
          <SettingsRow
            icon={<LogOut size={ICON_SIZE} color={colors.error} strokeWidth={ICON_STROKE} />}
            iconBg={colors.errorTint}
            label="Log Out"
            destructive
            showChevron={false}
            onPress={handleLogout}
            isLast
          />
        </SettingsSection>

      </ScrollView>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: -16,
  },
  scroll: {
    gap: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heading: {
    gap: 3,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileRetry: {
    backgroundColor: colors.warningTint,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  profileRetryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileRetrySub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default SettingsScreen;
