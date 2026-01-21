/**
 * Purchase and Subscription Types
 */

import { PurchasesPackage } from 'react-native-purchases';

/**
 * Subscription tier
 */
export type SubscriptionTier = 'free' | 'premium';

/**
 * Subscription status
 */
export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expirationDate?: string;
  productIdentifier?: string;
  willRenew: boolean;
}

/**
 * Available package/pricing option
 */
export interface PricingPackage {
  identifier: string;
  packageType: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
  rcPackage: PurchasesPackage;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  success: boolean;
  customerInfo?: any;
  error?: string;
  userCancelled: boolean;
}

/**
 * Premium feature limits
 */
export interface FeatureLimits {
  savedWords: number | 'unlimited';
  dailyStories: number | 'unlimited';
}

/**
 * Usage statistics (for limit tracking)
 */
export interface UsageStats {
  savedWordsCount: number;
  storiesGeneratedToday: number;
  lastResetDate: string;
}
