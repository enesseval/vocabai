/**
 * Premium Gate Component
 *
 * Shows upgrade prompts when free tier limits are reached
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { usePurchase } from '../context/PurchaseContext';

interface PremiumGateProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title: string;
  message: string;
  feature: 'savedWords' | 'stories';
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  visible,
  onClose,
  onUpgrade,
  title,
  message,
  feature,
}) => {
  const { limits, usage } = usePurchase();

  const getProgressText = () => {
    if (feature === 'savedWords') {
      return `${usage.savedWordsCount} / ${limits.savedWords} words saved`;
    }
    return `${usage.storiesGeneratedToday} / ${limits.dailyStories} stories today`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👑</Text>
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{getProgressText()}</Text>
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Merriweather-Bold',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-SemiBold',
  },
  upgradeButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
});
