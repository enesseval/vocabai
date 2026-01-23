// src/screens/PaywallScreen.tsx

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { PlanOption, SubscriptionPlan } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PLANS: PlanOption[] = [
    {
        id: 'weekly',
        name: 'Weekly',
        price: '₺99.99',
        duration: 'per week',
        features: ['7-day trial', 'Cancel anytime'],
        discount: '7 days free',
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: '₺199.99',
        duration: 'per month',
        features: ['Most flexible', 'Cancel anytime'],
        badge: 'Most Popular',
        isMostPopular: true,
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: '₺1,199.99',
        priceMonthly: '₺100/month',
        duration: 'per year',
        features: ['Best value', 'Save 50%'],
        badge: 'Best Value',
        discount: 'Save ₺1,200',
    },
];

const PREMIUM_FEATURES = [
    { icon: 'infinite', title: 'Unlimited AI Stories', subtitle: 'New personalized stories every day' },
    { icon: 'school', title: 'Advanced Quiz System', subtitle: 'Spaced repetition & smart reviews' },
    { icon: 'stats-chart', title: 'Detailed Analytics', subtitle: 'Track your progress & achievements' },
    { icon: 'cloud-download', title: 'Offline Access', subtitle: 'Download stories for offline reading' },
    { icon: 'trophy', title: 'Achievements & Badges', subtitle: 'Unlock rewards as you learn' },
    { icon: 'mic', title: 'Voice Recording', subtitle: 'Practice pronunciation with AI feedback' },
];

export default function PaywallScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { updateSubscription } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePlanSelect = (planId: SubscriptionPlan) => {
        setSelectedPlan(planId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
        ]).start();
    };

    const handleSubscribe = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateSubscription(selectedPlan);

        // Navigate to main tabs
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Skip Button */}
            <TouchableOpacity
                style={[styles.skipButton, { top: insets.top + 16 }]}
                onPress={handleSkip}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.iconGradient}
                        >
                            <Ionicons name="rocket" size={40} color="#000" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Unlock Premium</Text>
                    <Text style={styles.subtitle}>
                        Master languages faster with unlimited access to all features
                    </Text>
                </View>

                {/* Premium Features */}
                <View style={styles.featuresContainer}>
                    {PREMIUM_FEATURES.map((feature, index) => (
                        <BlurView
                            key={index}
                            intensity={15}
                            tint="dark"
                            style={styles.featureCard}
                        >
                            <View style={styles.featureIcon}>
                                <Ionicons name={feature.icon as any} size={24} color="#fbbf24" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                            </View>
                        </BlurView>
                    ))}
                </View>

                {/* Plan Selection */}
                <View style={styles.plansContainer}>
                    <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                    {PLANS.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            onPress={() => handlePlanSelect(plan.id)}
                            activeOpacity={0.8}
                        >
                            <Animated.View
                                style={[
                                    { transform: selectedPlan === plan.id ? [{ scale: scaleAnim }] : [] }
                                ]}
                            >
                                <BlurView
                                    intensity={20}
                                    tint="dark"
                                    style={[
                                        styles.planCard,
                                        selectedPlan === plan.id && styles.planCardSelected,
                                    ]}
                                >
                                    {plan.badge && (
                                        <View style={[
                                            styles.badge,
                                            plan.isMostPopular && styles.badgePopular
                                        ]}>
                                            <Text style={styles.badgeText}>{plan.badge}</Text>
                                        </View>
                                    )}

                                    <View style={styles.planHeader}>
                                        <View style={styles.planInfo}>
                                            <Text style={styles.planName}>{plan.name}</Text>
                                            <View style={styles.priceRow}>
                                                <Text style={styles.planPrice}>{plan.price}</Text>
                                                <Text style={styles.planDuration}>/{plan.duration.split(' ')[1]}</Text>
                                            </View>
                                            {plan.priceMonthly && (
                                                <Text style={styles.priceMonthly}>{plan.priceMonthly}</Text>
                                            )}
                                        </View>

                                        <View style={[
                                            styles.radioOuter,
                                            selectedPlan === plan.id && styles.radioOuterSelected
                                        ]}>
                                            {selectedPlan === plan.id && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.planFeatures}>
                                        {plan.features.map((feature, idx) => (
                                            <View key={idx} style={styles.planFeature}>
                                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                                <Text style={styles.planFeatureText}>{feature}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {plan.discount && (
                                        <View style={styles.discountTag}>
                                            <Text style={styles.discountText}>{plan.discount}</Text>
                                        </View>
                                    )}
                                </BlurView>
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Trust Signals */}
                <View style={styles.trustSignals}>
                    <View style={styles.trustItem}>
                        <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                        <Text style={styles.trustText}>Cancel anytime</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons name="people" size={20} color="#10b981" />
                        <Text style={styles.trustText}>100K+ learners</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons name="lock-closed" size={20} color="#10b981" />
                        <Text style={styles.trustText}>Secure payment</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <BlurView
                intensity={50}
                tint="dark"
                style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}
            >
                <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={handleSubscribe}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#fbbf24', '#f59e0b']}
                        style={styles.subscribeGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.subscribeButtonText}>Start Learning</Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    skipButton: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresContainer: {
        gap: 12,
        marginBottom: 40,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        marginBottom: 4,
    },
    featureSubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        lineHeight: 18,
    },
    plansContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    badgePopular: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: '#7c3aed',
    },
    badgeText: {
        color: '#fbbf24',
        fontSize: 11,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        color: '#fff',
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    planPrice: {
        color: '#fbbf24',
        fontSize: 28,
        fontFamily: FONTS.bold,
    },
    planDuration: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginLeft: 4,
    },
    priceMonthly: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginTop: 4,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#fbbf24',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fbbf24',
    },
    planFeatures: {
        gap: 8,
        marginBottom: 12,
    },
    planFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    planFeatureText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    discountTag: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    discountText: {
        color: '#10b981',
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    trustSignals: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        paddingTop: 20,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    subscribeButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    subscribeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    subscribeButtonText: {
        color: '#000',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    restoreButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    restoreText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
});
