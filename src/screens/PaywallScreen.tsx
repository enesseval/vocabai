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
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types/navigation';
import { PlanOption, SubscriptionPlan } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';
import { FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const PLANS: PlanOption[] = [
    {
        id: 'weekly',
        name: 'Weekly',
        price: '₺99.99',
        duration: 'per week',
        features: ['7-day trial', 'Cancel anytime'],
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

export default function PaywallScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { updateSubscription } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    console.log('PaywallScreen rendered!'); // DEBUG

    const handlePlanSelect = (planId: SubscriptionPlan) => {
        setSelectedPlan(planId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
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

            {/* Subtle Skip Button */}
            <TouchableOpacity
                style={[styles.skipButton, { top: insets.top + 12 }]}
                onPress={handleSkip}
                activeOpacity={0.6}
            >
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 120 }
                ]}
            >
                {/* Compact Header */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#fbbf24', '#f59e0b']}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="star" size={32} color="#000" />
                    </LinearGradient>
                    <Text style={styles.title}>{t('paywall.title')}</Text>
                    <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
                </View>

                {/* Compact Features - 3 main benefits */}
                <View style={styles.benefitsContainer}>
                    <View style={styles.benefitRow}>
                        <Ionicons name="infinite" size={20} color="#fbbf24" />
                        <Text style={styles.benefitText}>{t('paywall.benefit1')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <Ionicons name="school" size={20} color="#fbbf24" />
                        <Text style={styles.benefitText}>{t('paywall.benefit2')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <Ionicons name="stats-chart" size={20} color="#fbbf24" />
                        <Text style={styles.benefitText}>{t('paywall.benefit3')}</Text>
                    </View>
                </View>

                {/* Plan Cards - Compact Design */}
                <Text style={styles.sectionTitle}>{t('paywall.choosePlan')}</Text>
                <View style={styles.plansGrid}>
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
                                        plan.isMostPopular && styles.planCardPopular,
                                    ]}
                                >
                                    {/* Badge - Top Right */}
                                    {plan.badge && (
                                        <View style={[
                                            styles.badge,
                                            plan.isMostPopular && styles.badgePopular
                                        ]}>
                                            <Text style={styles.badgeText}>{t(`paywall.${plan.badge.toLowerCase().replace(' ', '')}`)}</Text>
                                        </View>
                                    )}

                                    {/* Radio Button - Top Left */}
                                    <View style={[
                                        styles.radioOuter,
                                        selectedPlan === plan.id && styles.radioOuterSelected
                                    ]}>
                                        {selectedPlan === plan.id && (
                                            <View style={styles.radioInner} />
                                        )}
                                    </View>

                                    <View style={styles.planContent}>
                                        <Text style={styles.planName}>{t(`paywall.plan${plan.name}`)}</Text>
                                        <View style={styles.priceRow}>
                                            <Text style={styles.planPrice}>{plan.price}</Text>
                                            <Text style={styles.planDuration}>/{t(`paywall.${plan.duration.split(' ')[1]}`)}</Text>
                                        </View>
                                        {plan.priceMonthly && (
                                            <Text style={styles.priceMonthly}>{plan.priceMonthly}</Text>
                                        )}
                                        {plan.discount && (
                                            <Text style={styles.discountText}>✨ {plan.discount}</Text>
                                        )}
                                    </View>
                                </BlurView>
                            </Animated.View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Trust Signals */}
                <View style={styles.trustSignals}>
                    <View style={styles.trustItem}>
                        <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                        <Text style={styles.trustText}>{t('paywall.cancelAnytime')}</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons name="people" size={16} color="#10b981" />
                        <Text style={styles.trustText}>{t('paywall.users')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Compact Bottom CTA */}
            <BlurView
                intensity={50}
                tint="dark"
                style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}
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
                        <Text style={styles.subscribeButtonText}>{t('paywall.startLearning')}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
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
        right: 16,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    benefitsContainer: {
        gap: 12,
        marginBottom: 32,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    benefitText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: FONTS.regular,
        flex: 1,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    plansGrid: {
        gap: 12,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'visible',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    planCardPopular: {
        borderColor: '#7c3aed',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: 12,
        backgroundColor: 'rgba(251, 191, 36, 0.95)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        zIndex: 1,
    },
    badgePopular: {
        backgroundColor: 'rgba(124, 58, 237, 0.95)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    radioOuter: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    radioOuterSelected: {
        borderColor: '#fbbf24',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fbbf24',
    },
    planContent: {
        marginLeft: 32,
    },
    planName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    planPrice: {
        color: '#fbbf24',
        fontSize: 22,
        fontFamily: FONTS.bold,
    },
    planDuration: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginLeft: 4,
    },
    priceMonthly: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    discountText: {
        color: '#10b981',
        fontSize: 12,
        fontFamily: FONTS.semiBold,
        marginTop: 6,
    },
    trustSignals: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 16,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontFamily: FONTS.regular,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        paddingTop: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    subscribeButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 8,
    },
    subscribeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    subscribeButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    restoreButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    restoreText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
});
