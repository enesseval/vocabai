/**
 * Purchase Context
 *
 * Manages Revenue Cat integration and subscription state
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SubscriptionStatus,
  PricingPackage,
  PurchaseResult,
  FeatureLimits,
  UsageStats,
} from '../types/purchase';
import { REVENUECAT_CONFIG, FREE_TIER_LIMITS } from '../config/revenueCat';

interface PurchaseContextValue {
  // Subscription state
  subscription: SubscriptionStatus;
  isLoading: boolean;

  // Available offerings
  packages: PricingPackage[];

  // Actions
  purchasePackage: (pkg: PricingPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;

  // Feature limits
  limits: FeatureLimits;
  usage: UsageStats;

  // Feature checks
  canSaveWord: () => boolean;
  canGenerateStory: () => boolean;

  // Usage tracking
  incrementSavedWords: () => Promise<void>;
  incrementStoryGeneration: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  USAGE_STATS: '@vocabai/usage_stats',
};

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: 'free',
    isActive: false,
    willRenew: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [usage, setUsage] = useState<UsageStats>({
    savedWordsCount: 0,
    storiesGeneratedToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
  });

  // Initialize Revenue Cat
  useEffect(() => {
    initializePurchases();
    loadUsageStats();
  }, []);

  const initializePurchases = async () => {
    try {
      // Configure Revenue Cat
      const apiKey = Platform.select({
        ios: REVENUECAT_CONFIG.apiKeys.ios,
        android: REVENUECAT_CONFIG.apiKeys.android,
        default: '',
      });

      if (!apiKey || apiKey.includes('YOUR_')) {
        console.warn('Revenue Cat API key not configured');
        setIsLoading(false);
        return;
      }

      await Purchases.configure({ apiKey });

      // Set up listener for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        updateSubscriptionStatus(info);
      });

      // Get initial customer info
      const customerInfo = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(customerInfo);

      // Load available offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        loadPackages(offerings.current);
      }
    } catch (error) {
      console.error('Failed to initialize purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionStatus = (customerInfo: CustomerInfo) => {
    const premiumEntitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlements.premium];

    if (premiumEntitlement) {
      setSubscription({
        tier: 'premium',
        isActive: true,
        expirationDate: premiumEntitlement.expirationDate || undefined,
        productIdentifier: premiumEntitlement.productIdentifier,
        willRenew: premiumEntitlement.willRenew,
      });
    } else {
      setSubscription({
        tier: 'free',
        isActive: false,
        willRenew: false,
      });
    }
  };

  const loadPackages = (offering: PurchasesOffering) => {
    const mappedPackages: PricingPackage[] = offering.availablePackages.map((pkg) => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType as 'MONTHLY' | 'ANNUAL' | 'LIFETIME',
      product: {
        identifier: pkg.product.identifier,
        description: pkg.product.description,
        title: pkg.product.title,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
      },
      rcPackage: pkg,
    }));

    setPackages(mappedPackages);
  };

  const loadUsageStats = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      if (saved) {
        const stats: UsageStats = JSON.parse(saved);

        // Reset daily counter if it's a new day
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastResetDate !== today) {
          stats.storiesGeneratedToday = 0;
          stats.lastResetDate = today;
          await saveUsageStats(stats);
        }

        setUsage(stats);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const saveUsageStats = async (stats: UsageStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(stats));
      setUsage(stats);
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  };

  const purchasePackage = async (pkg: PricingPackage): Promise<PurchaseResult> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg.rcPackage);
      updateSubscriptionStatus(customerInfo);

      return {
        success: true,
        customerInfo,
        userCancelled: false,
      };
    } catch (error: any) {
      if (error.userCancelled) {
        return {
          success: false,
          userCancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
        userCancelled: false,
      };
    }
  };

  const restorePurchases = async (): Promise<PurchaseResult> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      updateSubscriptionStatus(customerInfo);

      return {
        success: true,
        customerInfo,
        userCancelled: false,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Restore failed',
        userCancelled: false,
      };
    }
  };

  const limits: FeatureLimits = {
    savedWords: subscription.tier === 'premium' ? 'unlimited' : FREE_TIER_LIMITS.savedWords,
    dailyStories: subscription.tier === 'premium' ? 'unlimited' : FREE_TIER_LIMITS.dailyStories,
  };

  const canSaveWord = useCallback(() => {
    if (subscription.tier === 'premium') return true;
    return usage.savedWordsCount < FREE_TIER_LIMITS.savedWords;
  }, [subscription.tier, usage.savedWordsCount]);

  const canGenerateStory = useCallback(() => {
    if (subscription.tier === 'premium') return true;
    return usage.storiesGeneratedToday < FREE_TIER_LIMITS.dailyStories;
  }, [subscription.tier, usage.storiesGeneratedToday]);

  const incrementSavedWords = async () => {
    const newStats = {
      ...usage,
      savedWordsCount: usage.savedWordsCount + 1,
    };
    await saveUsageStats(newStats);
  };

  const incrementStoryGeneration = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newStats = {
      ...usage,
      storiesGeneratedToday: usage.lastResetDate === today ? usage.storiesGeneratedToday + 1 : 1,
      lastResetDate: today,
    };
    await saveUsageStats(newStats);
  };

  const value: PurchaseContextValue = {
    subscription,
    isLoading,
    packages,
    purchasePackage,
    restorePurchases,
    limits,
    usage,
    canSaveWord,
    canGenerateStory,
    incrementSavedWords,
    incrementStoryGeneration,
  };

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within PurchaseProvider');
  }
  return context;
};
