import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

type FilterOption = {
  key: string;
  label: string;
};

type Props = {
  options: FilterOption[];
  active: string;
  onChange: (status: string) => void;
};

const TripFilterTab = ({ options, active, onChange }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map(opt => {
        const isActive = opt.key === active;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.7}
            style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.slateTint,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate,
  },
  tabLabelActive: {
    color: colors.surface,
  },
});

export default TripFilterTab;
