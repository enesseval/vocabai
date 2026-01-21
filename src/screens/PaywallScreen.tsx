/**
 * Paywall Screen
 *
 * Premium subscription pitch and purchase flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePurchase } from '../context/PurchaseContext';
import { PricingPackage } from '../types/purchase';
import { PREMIUM_FEATURES } from '../config/revenueCat';

type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

interface Props {
  navigation: PaywallScreenNavigationProp;
}

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { packages, purchasePackage, restorePurchases, isLoading } = usePurchase();
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  React.useEffect(() => {
    // Auto-select yearly package (best value)
    const yearlyPkg = packages.find((p) => p.packageType === 'ANNUAL');
    if (yearlyPkg) {
      setSelectedPackage(yearlyPkg);
    } else if (packages.length > 0) {
      setSelectedPackage(packages[0]);
    }
  }, [packages]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    const result = await purchasePackage(selectedPackage);
    setPurchasing(false);

    if (result.success) {
      Alert.alert('Welcome to Premium!', 'You now have unlimited access to all features.', [
        { text: 'Get Started', onPress: () => navigation.goBack() },
      ]);
    } else if (!result.userCancelled) {
      Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const result = await restorePurchases();
    setPurchasing(false);

    if (result.success) {
      Alert.alert('Purchases Restored', 'Your premium subscription has been restored.', [
        { text: 'Continue', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Restore Failed', result.error || 'No previous purchases found.');
    }
  };

  const getPackageLabel = (pkg: PricingPackage) => {
    if (pkg.packageType === 'ANNUAL') return 'Best Value';
    if (pkg.packageType === 'MONTHLY') return 'Popular';
    return '';
  };

  const getPricePerMonth = (pkg: PricingPackage) => {
    if (pkg.packageType === 'ANNUAL') {
      const monthlyPrice = pkg.product.price / 12;
      return `${pkg.product.currencyCode} ${monthlyPrice.toFixed(2)}/month`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <Text style={styles.headerSubtitle}>Unlock unlimited vocabulary learning</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {packages.map((pkg) => {
            const isSelected = selectedPackage?.identifier === pkg.identifier;
            const label = getPackageLabel(pkg);
            const pricePerMonth = getPricePerMonth(pkg);

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.pricingCard, isSelected && styles.pricingCardSelected]}
                onPress={() => setSelectedPackage(pkg)}
              >
                {label && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{label}</Text>
                  </View>
                )}

                <View style={styles.pricingContent}>
                  <View>
                    <Text style={styles.pricingTitle}>
                      {pkg.packageType === 'ANNUAL' ? 'Yearly' : 'Monthly'}
                    </Text>
                    {pricePerMonth && <Text style={styles.pricePerMonth}>{pricePerMonth}</Text>}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{pkg.product.priceString}</Text>
                    <Text style={styles.pricePeriod}>
                      {pkg.packageType === 'ANNUAL' ? '/year' : '/month'}
                    </Text>
                  </View>
                </View>

                {isSelected && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, purchasing && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing || !selectedPackage}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.ctaButtonText}>Start Premium</Text>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={purchasing}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cancel anytime. Auto-renews unless cancelled 24 hours before period ends.
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Merriweather-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    color: '#6C5CE7',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  pricingContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pricingCardSelected: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F5F3FF',
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  pricePerMonth: {
    fontSize: 14,
    color: '#6C5CE7',
    fontFamily: 'Inter-Regular',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Inter-Bold',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
  },
  ctaButton: {
    backgroundColor: '#6C5CE7',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  restoreButtonText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: '#6C5CE7',
    fontFamily: 'Inter-Regular',
  },
  footerDivider: {
    fontSize: 12,
    color: '#999999',
    marginHorizontal: 8,
  },
});
