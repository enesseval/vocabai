/**
 * Revenue Cat Configuration
 *
 * Setup:
 * 1. Create account at https://app.revenuecat.com
 * 2. Create new app project
 * 3. Add iOS/Android apps
 * 4. Get API keys from Settings > API Keys
 * 5. Create products in App Store Connect / Google Play Console
 * 6. Configure products in Revenue Cat dashboard
 */

export const REVENUECAT_CONFIG = {
  // TODO: Replace with your actual Revenue Cat API keys
  // Get from: https://app.revenuecat.com/settings/api-keys
  apiKeys: {
    ios: 'appl_YOUR_IOS_API_KEY_HERE',
    android: 'goog_YOUR_ANDROID_API_KEY_HERE',
  },

  // Entitlement identifier (configured in Revenue Cat dashboard)
  entitlements: {
    premium: 'premium',
  },

  // Product identifiers (must match App Store Connect / Google Play Console)
  products: {
    monthly: 'vocabai_premium_monthly',
    yearly: 'vocabai_premium_yearly',
  },
} as const;

/**
 * Free tier limits
 */
export const FREE_TIER_LIMITS = {
  savedWords: 50,
  dailyStories: 5,
} as const;

/**
 * Premium features
 */
export const PREMIUM_FEATURES = [
  'Unlimited saved words',
  'Unlimited AI story generation',
  'Advanced SRS algorithm',
  'Detailed progress analytics',
  'Priority support',
  'Ad-free experience',
] as const;
