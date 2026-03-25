import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Save, Phone, FileText, Star, Clock, User, Wifi, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { colors } from '../theme/colors';
import Loader from '../components/ui/Loader';
import { useDriver } from '../context/DriverContext';
import { useUpdateProfile } from '../features/driver/hooks/useUpdateProfile';
import type { DriverStatus } from '../features/driver/types';
import { formatDate } from '../utils/dateUtils';

type StatusOption = {
  value: DriverStatus;
  label: string;
  color: string;
  bg: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'AVAILABLE', label: 'Available',  color: colors.success, bg: colors.successTint },
  { value: 'OFF_DUTY',  label: 'Off Duty',   color: colors.slate,   bg: colors.slateTint   },
  { value: 'ON_LEAVE',  label: 'On Leave',   color: colors.orange,  bg: colors.orangeTint  },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);


const ProfileDetailScreen = () => {
  const { driver, isLoading, isError, refetch } = useDriver();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [name, setName] = useState(driver?.name ?? '');
  const [selectedStatus, setSelectedStatus] = useState<DriverStatus>(
    driver?.status ?? 'AVAILABLE',
  );

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const isDirty =
    name.trim() !== (driver?.name ?? '') ||
    selectedStatus !== (driver?.status ?? 'AVAILABLE');

  const handleSave = useCallback(() => {
    if (!isDirty || isPending) return;
    const payload: { name?: string; status?: string } = {};
    if (name.trim() !== driver?.name) payload.name = name.trim();
    if (selectedStatus !== driver?.status) payload.status = selectedStatus;
    updateProfile(payload);
  }, [isDirty, isPending, name, selectedStatus, driver, updateProfile]);

  if (isLoading && !driver) {
    return (
      <View style={styles.loadingRoot}>
        <Loader message="Loading profile…" />
      </View>
    );
  }

  if (isError && !driver) {
    return (
      <View style={[styles.errorRoot, { paddingTop: insets.top }]}>
        <View style={styles.errorContent}>
          <AlertTriangle size={60} color={colors.error} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <Text style={styles.errorSubtitle}>
            There was a problem fetching your driver account details.
          </Text>
          <TouchableOpacity 
            style={styles.retryBtn} 
            onPress={refetch}
            activeOpacity={0.8}
          >
            <RefreshCw size={18} color={colors.surface} strokeWidth={2.5} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!driver) return null;

  const rating = parseFloat(String(driver.rating)).toFixed(1);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}>
            <ChevronLeft size={22} color={colors.surface} strokeWidth={2.2} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Profile</Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!isDirty || isPending}
            style={[styles.saveBtn, (!isDirty || isPending) && styles.saveBtnDisabled]}
            activeOpacity={0.8}>
            {isPending ? (
              <ActivityIndicator size={14} color={colors.surface} />
            ) : (
              <Save size={15} color={colors.surface} strokeWidth={2.2} />
            )}
            <Text style={styles.saveBtnText}>{isPending ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.heroSection}>
            <View style={styles.avatarWrapper}>
              {driver.profileUrl ? (
                <Image source={{ uri: driver.profileUrl }} style={styles.photo} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.initials}>{getInitials(driver.name)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroName}>{driver.name}</Text>
            <Text style={styles.heroId}>ID · {driver.id.slice(0, 8).toUpperCase()}</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <View style={styles.statRow}>
                <Star size={14} color={colors.secondary} fill={colors.secondary} />
                <Text style={styles.statValue}>{rating}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{driver.rating_count}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {formatDate(driver.createdAt).split(' ').slice(1).join(' ')}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BASIC INFO</Text>

            <View style={styles.fieldGroup}>
              <FieldLabel icon={<User size={14} color={colors.primary} strokeWidth={2} />} label="Full Name" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel icon={<Phone size={14} color={colors.primary} strokeWidth={2} />} label="Mobile Number" />
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyText}>{driver.mobileNumber}</Text>
                <View style={styles.readonlyBadge}>
                  <Text style={styles.readonlyBadgeText}>Verified</Text>
                </View>
              </View>
            </View>

            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <FieldLabel icon={<FileText size={14} color={colors.primary} strokeWidth={2} />} label="License Number" />
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyText}>{driver.licenseNumber}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVAILABILITY STATUS</Text>
            <Text style={styles.sectionSubtitle}>
              Set your current availability. ON_TRIP and BLOCKED are managed by the system.
            </Text>

            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map(opt => {
                const active = selectedStatus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSelectedStatus(opt.value)}
                    activeOpacity={0.75}
                    style={[
                      styles.statusOption,
                      { backgroundColor: active ? opt.bg : colors.surface },
                      active && { borderColor: opt.color },
                    ]}>
                    <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                    <Text
                      style={[
                        styles.statusOptionText,
                        { color: active ? opt.color : colors.textSecondary },
                        active && { fontWeight: '700' },
                      ]}>
                      {opt.label}
                    </Text>
                    {active && (
                      <View style={[styles.checkMark, { backgroundColor: opt.color }]}>
                        <Text style={styles.checkMarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>

            <InfoRow
              icon={<Clock size={14} color={colors.textSecondary} strokeWidth={2} />}
              label="Member Since"
              value={formatDate(driver.createdAt)}
            />
            <InfoRow
              icon={<Wifi size={14} color={colors.textSecondary} strokeWidth={2} />}
              label="Last Login"
              value={driver.lastLogin ? formatDate(driver.lastLogin) : '—'}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const FieldLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <View style={styles.fieldLabelRow}>
    {icon}
    <Text style={styles.fieldLabel}>{label}</Text>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoRowLeft}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.2,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, gap: 16 },
  heroSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  avatarWrapper: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  heroId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: -4,
  },
  fieldGroup: {
    gap: 6,
    marginBottom: 4,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  readonlyField: {
    backgroundColor: colors.slateTint,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readonlyText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  readonlyBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  readonlyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 0.3,
  },
  statusGrid: {
    gap: 10,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  checkMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    fontSize: 11,
    color: colors.surface,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default ProfileDetailScreen;
