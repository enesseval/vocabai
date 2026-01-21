# Paywall & Revenue Cat Setup Guide

Complete guide to configuring Revenue Cat and in-app purchases for VocabAI.

---

## 📋 Table of Contents

1. [Revenue Cat Dashboard Setup](#1-revenue-cat-dashboard-setup)
2. [iOS App Store Connect Setup](#2-ios-app-store-connect-setup)
3. [Android Google Play Console Setup](#3-android-google-play-console-setup)
4. [Update API Keys](#4-update-api-keys)
5. [Testing](#5-testing)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Revenue Cat Dashboard Setup

### Step 1: Create Account
1. Go to [https://app.revenuecat.com](https://app.revenuecat.com)
2. Sign up for a free account
3. Create a new project named "VocabAI"

### Step 2: Add Apps
1. In the Revenue Cat dashboard, go to **Project Settings**
2. Click **Apps** → **Add App**
3. Add iOS app:
   - **App Name**: VocabAI iOS
   - **Bundle ID**: `com.vocabai.app` (match your iOS app)
   - **Platform**: iOS
4. Add Android app:
   - **App Name**: VocabAI Android
   - **Package Name**: `com.vocabai.app` (match your Android app)
   - **Platform**: Android

### Step 3: Get API Keys
1. Go to **Project Settings** → **API Keys**
2. Copy your API keys:
   - **iOS API Key**: `appl_xxxxxxxxxx`
   - **Android API Key**: `goog_xxxxxxxxxx`
3. Save these for Step 4

### Step 4: Create Entitlements
1. Go to **Entitlements**
2. Click **New Entitlement**
3. Create entitlement:
   - **Identifier**: `premium`
   - **Description**: Premium subscription access

### Step 5: Create Products
1. Go to **Products**
2. Click **New Product**
3. Create Monthly subscription:
   - **Product ID**: `vocabai_premium_monthly`
   - **Type**: Subscription
   - **Store Product IDs**:
     - iOS: `vocabai_premium_monthly`
     - Android: `vocabai_premium_monthly`
4. Create Yearly subscription:
   - **Product ID**: `vocabai_premium_yearly`
   - **Type**: Subscription
   - **Store Product IDs**:
     - iOS: `vocabai_premium_yearly`
     - Android: `vocabai_premium_yearly`

### Step 6: Create Offerings
1. Go to **Offerings**
2. Click **New Offering**
3. Create default offering:
   - **Identifier**: `default`
   - **Description**: Default premium offering
4. Add packages to offering:
   - **Monthly Package**: Link to `vocabai_premium_monthly`
   - **Annual Package**: Link to `vocabai_premium_yearly`

---

## 2. iOS App Store Connect Setup

### Step 1: Create App Record
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in app details:
   - **Platform**: iOS
   - **Name**: VocabAI
   - **Primary Language**: English
   - **Bundle ID**: `com.vocabai.app`
   - **SKU**: `vocabai-ios`

### Step 2: Create In-App Purchases
1. In your app, go to **Features** → **In-App Purchases**
2. Click **+** to create new subscription
3. Create **Monthly Subscription**:
   - **Reference Name**: Premium Monthly
   - **Product ID**: `vocabai_premium_monthly`
   - **Subscription Group**: Premium Subscriptions (create if new)
   - **Subscription Duration**: 1 Month
   - **Price**: $9.99 (or your preferred price)
   - **Localization**:
     - **Display Name**: Premium Monthly
     - **Description**: Unlimited vocabulary learning with AI-powered stories
   - **Review Screenshot**: Upload a screenshot of your paywall
4. Create **Yearly Subscription**:
   - **Reference Name**: Premium Yearly
   - **Product ID**: `vocabai_premium_yearly`
   - **Subscription Group**: Premium Subscriptions
   - **Subscription Duration**: 1 Year
   - **Price**: $79.99 (or your preferred price)
   - **Localization**:
     - **Display Name**: Premium Yearly
     - **Description**: Unlimited vocabulary learning with AI-powered stories - Best Value!
   - **Review Screenshot**: Upload a screenshot of your paywall

### Step 3: Submit for Review
1. Once you've configured all subscriptions, click **Submit for Review**
2. Wait for Apple to approve your in-app purchases
3. Note: You can test in sandbox mode before approval

### Step 4: Configure App Capabilities
1. In Xcode, select your project
2. Go to **Signing & Capabilities**
3. Click **+ Capability** → **In-App Purchase**
4. This enables StoreKit for your app

---

## 3. Android Google Play Console Setup

### Step 1: Create App
1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in app details:
   - **App name**: VocabAI
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

### Step 2: Create In-App Products
1. In your app, go to **Monetize** → **Products** → **Subscriptions**
2. Click **Create subscription**
3. Create **Monthly Subscription**:
   - **Product ID**: `vocabai_premium_monthly`
   - **Name**: Premium Monthly
   - **Description**: Unlimited vocabulary learning with AI-powered stories
   - **Billing period**: 1 Month
   - **Default price**: $9.99 USD
   - **Trial period**: None (or add if desired)
   - **Status**: Active
4. Create **Yearly Subscription**:
   - **Product ID**: `vocabai_premium_yearly`
   - **Name**: Premium Yearly
   - **Description**: Unlimited vocabulary learning with AI-powered stories - Best Value!
   - **Billing period**: 1 Year
   - **Default price**: $79.99 USD
   - **Trial period**: None
   - **Status**: Active

### Step 3: Configure Google Play Billing
1. Go to **Monetize** → **Monetization setup**
2. Complete the required steps:
   - Set up merchant account
   - Configure payment settings
   - Accept terms

### Step 4: Link to Revenue Cat
1. In Revenue Cat dashboard, go to **Project Settings** → **Google Play**
2. Upload your Google Play service account JSON:
   - In Google Play Console, go to **Setup** → **API access**
   - Create a new service account or use existing
   - Download JSON key file
   - Upload to Revenue Cat

---

## 4. Update API Keys

### Update Revenue Cat Configuration

Open `src/config/revenueCat.ts` and replace the placeholder API keys:

```typescript
export const REVENUECAT_CONFIG = {
  apiKeys: {
    ios: 'appl_YOUR_ACTUAL_IOS_KEY_HERE',  // ← Replace this
    android: 'goog_YOUR_ACTUAL_ANDROID_KEY_HERE',  // ← Replace this
  },
  // ... rest stays the same
};
```

**Where to find your API keys:**
- Revenue Cat Dashboard → **Project Settings** → **API Keys**
- Copy the **Public App-specific Key** for each platform

---

## 5. Testing

### iOS Sandbox Testing

1. **Create Sandbox Tester Account**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - **Users and Access** → **Sandbox Testers**
   - Click **+** to create new tester
   - Use a unique email (doesn't need to be real)
   - Set password and region

2. **Sign Out of App Store**:
   - On your test device, go to **Settings** → **App Store**
   - Tap your account at top → **Sign Out**

3. **Test Purchase Flow**:
   - Launch your app in debug mode
   - Navigate to Paywall
   - Attempt to purchase
   - Sign in with sandbox tester when prompted
   - Complete purchase (you won't be charged)

4. **Verify in Revenue Cat**:
   - Go to Revenue Cat Dashboard → **Customers**
   - Find your test user
   - Verify subscription is active

### Android Testing

1. **Add License Testers**:
   - Google Play Console → **Setup** → **License testing**
   - Add your Google account email
   - Set license test response to **RESPOND_NORMALLY**

2. **Use Internal Testing Track**:
   - Upload your APK to Internal Testing track
   - Add testers via email
   - Distribute test build

3. **Test Purchase**:
   - Install from Play Store (Internal Testing)
   - Navigate to Paywall
   - Complete purchase
   - For testing, purchases are refunded automatically

### Test Restore Purchases

1. Complete a test purchase
2. Uninstall and reinstall the app
3. Navigate to Paywall
4. Tap **Restore Purchases**
5. Verify subscription is restored

---

## 6. Troubleshooting

### Common Issues

#### "Unable to complete request" on iOS
**Cause**: In-App Purchases not approved yet
**Solution**: Use sandbox tester and wait for approval, or check App Store Connect status

#### "Product not found"
**Cause**: Product IDs don't match between code, Revenue Cat, and App/Play Store
**Solution**:
1. Verify Product IDs match exactly in:
   - `src/config/revenueCat.ts`
   - Revenue Cat Dashboard → Products
   - App Store Connect / Play Console
2. Check that products are active

#### Revenue Cat returns empty offerings
**Cause**: API keys incorrect or offerings not configured
**Solution**:
1. Check API keys in `src/config/revenueCat.ts`
2. Verify offering is created in Revenue Cat Dashboard
3. Check offering has packages linked to products

#### Purchase succeeds but subscription not detected
**Cause**: Entitlement not configured
**Solution**:
1. Verify entitlement `premium` exists in Revenue Cat
2. Check that products grant the entitlement
3. Use Revenue Cat Dashboard → **Customers** to debug

#### Android: "Error retrieving products"
**Cause**: Google Play Billing not configured
**Solution**:
1. Upload service account JSON to Revenue Cat
2. Wait 24 hours for Google Play to propagate changes
3. Ensure products are set to **Active**

---

## 📱 Integration Checklist

Before going live, verify:

- [ ] Revenue Cat account created
- [ ] iOS and Android apps added to Revenue Cat
- [ ] API keys updated in `src/config/revenueCat.ts`
- [ ] Entitlement `premium` created
- [ ] Products created (monthly + yearly)
- [ ] Offering created with packages
- [ ] iOS: In-App Purchases created in App Store Connect
- [ ] iOS: Subscriptions approved by Apple
- [ ] Android: Subscriptions created in Play Console
- [ ] Android: Service account linked to Revenue Cat
- [ ] Tested purchase flow on iOS sandbox
- [ ] Tested purchase flow on Android
- [ ] Tested restore purchases
- [ ] Verified free tier limits work
- [ ] Verified premium unlocks features

---

## 🎯 Free vs Premium Features

Current feature gating:

| Feature | Free Tier | Premium |
|---------|-----------|---------|
| Saved Words | 50 words | ∞ Unlimited |
| Daily Stories | 5 per day | ∞ Unlimited |
| SRS Review | ✅ Yes | ✅ Yes |
| Audio Playback | ✅ Yes | ✅ Yes |
| Native Widgets | ✅ Yes | ✅ Yes |
| Ad-Free | ❌ No | ✅ Yes |

To modify limits, edit `src/config/revenueCat.ts`:

```typescript
export const FREE_TIER_LIMITS = {
  savedWords: 50,      // ← Change this
  dailyStories: 5,     // ← Change this
} as const;
```

---

## 📚 Additional Resources

- [Revenue Cat Documentation](https://docs.revenuecat.com/)
- [iOS In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Android Billing Guide](https://developer.android.com/google/play/billing)
- [Testing Subscriptions (iOS)](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_in_xcode)
- [Testing Subscriptions (Android)](https://developer.android.com/google/play/billing/test)

---

## 💡 Next Steps

After completing setup:

1. Test thoroughly in sandbox/testing tracks
2. Submit app for review
3. Monitor Revenue Cat Dashboard for analytics
4. Track conversion rates and optimize pricing
5. Consider adding free trial period
6. Implement promotional offers

Good luck with your launch! 🚀
