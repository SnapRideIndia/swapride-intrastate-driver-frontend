import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Star, Phone, FileText } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import type { DriverProfile, DriverStatus } from '../../driver/types';
import { formatMonthYear } from '../../../utils/dateUtils';

type Props = {
  profile: DriverProfile;
  onEditPress?: () => void;
};

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
};

const STATUS_CONFIG: Record<DriverStatus, StatusConfig> = {
  AVAILABLE: { label: 'Available',  color: colors.success, bg: colors.successTint },
  ON_TRIP:   { label: 'On Trip',    color: colors.primary, bg: colors.primaryTint },
  OFF_DUTY:  { label: 'Off Duty',   color: colors.slate,   bg: colors.slateTint   },
  ON_LEAVE:  { label: 'On Leave',   color: colors.orange,  bg: colors.orangeTint  },
  BLOCKED:   { label: 'Blocked',    color: colors.error,   bg: colors.errorTint   },
};

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);


const DriverProfileCard = ({ profile, onEditPress }: Props) => {
  const status = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.OFF_DUTY;
  const rating = parseFloat(String(profile.rating)).toFixed(1);

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        {/* Avatar / Photo */}
        {profile.profileUrl ? (
          <Image source={{ uri: profile.profileUrl }} style={styles.photo} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.initials}>{getInitials(profile.name)}</Text>
          </View>
        )}

        {/* Name + status + meta */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{profile.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Phone size={11} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText}>{profile.mobileNumber}</Text>
          </View>

          <View style={styles.metaRow}>
            <FileText size={11} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText}>{profile.licenseNumber}</Text>
          </View>
        </View>

        {/* Edit */}
        <TouchableOpacity
          onPress={onEditPress}
          style={styles.editBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Edit2 size={15} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <View style={styles.ratingValue}>
            <Star size={13} color={colors.secondary} fill={colors.secondary} />
            <Text style={styles.statValue}>{rating}</Text>
          </View>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatMonthYear(profile.createdAt)}</Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.slateTint,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
});

export default DriverProfileCard;
