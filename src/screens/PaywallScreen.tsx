// src/screens/PaywallScreen.tsx
// Social Proof Paywall (Variant A)

import React, { useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types/navigation';
import { SubscriptionPlan } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';
import { PaywallVariantA } from './paywall/PaywallVariantA';

export default function PaywallScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { updateSubscription, subscription } = useSubscription();

    // Calculate user metrics
    const daysSinceSignup = useMemo(() => {
        if (!subscription?.startDate) return 0;
        const signupDate = new Date(subscription.startDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - signupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [subscription?.startDate]);

    // Mock data for streak (TODO: Replace with actual user data)
    const currentStreak = 15;

    // Handle subscription
    const handleSubscribe = async (plan: SubscriptionPlan) => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await updateSubscription(plan);

            // Navigate to home (MainTabs)
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            console.error('[Paywall] Subscription error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    // Handle dismiss - go to home
    const handleDismiss = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    // Handle restore purchases
    const handleRestore = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Implement restore purchases logic
        console.log('[Paywall] Restore purchases requested');
    };

    return (
        <PaywallVariantA
            onSubscribe={handleSubscribe}
            onDismiss={handleDismiss}
            onRestore={handleRestore}
            currentStreak={currentStreak}
            daysSinceSignup={daysSinceSignup}
            isLoading={false}
        />
    );
}
