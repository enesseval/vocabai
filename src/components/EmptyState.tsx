/**
 * EmptyState Component
 *
 * Reusable empty state component for screens with no content
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      <View style={styles.content}>
        {/* Icon with gradient background */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(108, 92, 231, 0.2)', 'rgba(108, 92, 231, 0.05)']}
            style={styles.iconGradient}
          >
            <Ionicons name={icon} size={isCompact ? 40 : 56} color="#6C5CE7" />
          </LinearGradient>
        </View>

        {/* Text Content */}
        <Text style={[styles.title, isCompact && styles.titleCompact]}>{title}</Text>
        <Text style={[styles.description, isCompact && styles.descriptionCompact]}>
          {description}
        </Text>

        {/* Optional Action Button */}
        {actionLabel && onAction && (
          <TouchableOpacity
            style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  containerCompact: {
    paddingVertical: 60,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Merriweather-Bold',
  },
  titleCompact: {
    fontSize: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  descriptionCompact: {
    fontSize: 14,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  actionButtonCompact: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
