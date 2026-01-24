// src/screens/PaywallScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated
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
import { SubscriptionPlan } from '../types/subscription';
import { useSubscription } from '../context/SubscriptionContext';
import { FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { updateSubscription } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const checkmark1 = useRef(new Animated.Value(0)).current;
    const checkmark2 = useRef(new Animated.Value(0)).current;
    const checkmark3 = useRef(new Animated.Value(0)).current;
    const checkmark4 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered checkmark animations
        setTimeout(() => animateCheckmark(checkmark1), 300);
        setTimeout(() => animateCheckmark(checkmark2), 450);
        setTimeout(() => animateCheckmark(checkmark3), 600);
        setTimeout(() => animateCheckmark(checkmark4), 750);

        // Pulse animation for CTA
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const animateCheckmark = (anim: Animated.Value) => {
        Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 12,
        }).start();
    };

    const handleSubscribe = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateSubscription(selectedPlan);
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

    const AnimatedCheck = ({ anim, delay }: { anim: Animated.Value; delay: number }) => (
        <Animated.View
            style={[
                styles.checkCircle,
                {
                    opacity: anim,
                    transform: [{ scale: anim }],
                },
            ]}
        >
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Subtle Skip */}
            <TouchableOpacity
                style={[styles.skipButton, { top: insets.top + 8 }]}
                onPress={handleSkip}
                activeOpacity={0.5}
            >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.25)" />
            </TouchableOpacity>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 140 }
                ]}
            >
                {/* Hero Section */}
                <Animated.View style={[styles.hero, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Social Proof Badge */}
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#fbbf24" />
                        <Text style={styles.ratingText}>4.8</Text>
                        <Text style={styles.ratingSubtext}>• 100K+ users</Text>
                    </View>

                    <Text style={styles.heroTitle}>
                        {t('paywall.heroTitle')}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        {t('paywall.heroSubtitle')}
                    </Text>
                </Animated.View>

                {/* Benefits - Animated Checkmarks */}
                <View style={styles.benefitsSection}>
                    <View style={styles.benefitRow}>
                        <AnimatedCheck anim={checkmark1} delay={300} />
                        <Text style={styles.benefitText}>{t('paywall.benefit1')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <AnimatedCheck anim={checkmark2} delay={450} />
                        <Text style={styles.benefitText}>{t('paywall.benefit2')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <AnimatedCheck anim={checkmark3} delay={600} />
                        <Text style={styles.benefitText}>{t('paywall.benefit3')}</Text>
                    </View>
                    <View style={styles.benefitRow}>
                        <AnimatedCheck anim={checkmark4} delay={750} />
                        <Text style={styles.benefitText}>{t('paywall.benefit4')}</Text>
                    </View>
                </View>

                {/* Plan Cards - Compact, Side by Side */}
                <View style={styles.plansSection}>
                    {/* Yearly - RECOMMENDED */}
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedPlan('yearly');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={selectedPlan === 'yearly' ? ['#fbbf24', '#f59e0b'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            style={[
                                styles.planCard,
                                selectedPlan === 'yearly' && styles.planCardSelected,
                            ]}
                        >
                            {/* Best Value Badge */}
                            <View style={styles.bestValueBadge}>
                                <Text style={styles.bestValueText}>BEST VALUE</Text>
                            </View>

                            <View style={styles.planHeader}>
                                <Text style={[styles.planName, selectedPlan === 'yearly' && { color: '#000' }]}>
                                    {t('paywall.planYearly')}
                                </Text>
                                <View style={styles.savingsBadge}>
                                    <Text style={styles.savingsText}>Save 50%</Text>
                                </View>
                            </View>

                            <Text style={[styles.planPrice, selectedPlan === 'yearly' && { color: '#000' }]}>
                                ₺1,199
                                <Text style={[styles.planDuration, selectedPlan === 'yearly' && { color: 'rgba(0,0,0,0.6)' }]}>
                                    /{t('paywall.year')}
                                </Text>
                            </Text>

                            <Text style={[styles.dailyCost, selectedPlan === 'yearly' && { color: 'rgba(0,0,0,0.7)' }]}>
                                ₺3.28/{t('paywall.day')}
                            </Text>

                            <Text style={[styles.trialText, selectedPlan === 'yearly' && { color: 'rgba(0,0,0,0.8)' }]}>
                                ✨ 7 {t('paywall.daysFree')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Monthly */}
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedPlan('monthly');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        activeOpacity={0.8}
                    >
                        <BlurView
                            intensity={15}
                            tint="dark"
                            style={[
                                styles.planCard,
                                styles.planCardSecondary,
                                selectedPlan === 'monthly' && styles.planCardSelectedSecondary,
                            ]}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{t('paywall.planMonthly')}</Text>
                            </View>

                            <Text style={styles.planPrice}>
                                ₺199
                                <Text style={styles.planDuration}>/{t('paywall.month')}</Text>
                            </Text>

                            <Text style={styles.dailyCost}>
                                ₺6.63/{t('paywall.day')}
                            </Text>

                            <Text style={styles.trialText}>
                                7 {t('paywall.daysFree')}
                            </Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>

                {/* Trust Signals */}
                <View style={styles.trustSection}>
                    <View style={styles.trustRow}>
                        <Ionicons name="lock-closed" size={14} color="#10b981" />
                        <Text style={styles.trustText}>{t('paywall.securePayment')}</Text>
                    </View>
                    <View style={styles.trustRow}>
                        <Ionicons name="refresh" size={14} color="#10b981" />
                        <Text style={styles.trustText}>{t('paywall.cancelAnytime')}</Text>
                    </View>
                    <View style={styles.trustRow}>
                        <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                        <Text style={styles.trustText}>{t('paywall.noCommitment')}</Text>
                    </View>
                </View>

                {/* Fine Print */}
                <Text style={styles.finePrint}>
                    {t('paywall.finePrint')}
                </Text>
            </Animated.ScrollView>

            {/* Fixed CTA */}
            <BlurView
                intensity={80}
                tint="dark"
                style={[styles.ctaContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleSubscribe}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.ctaGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
                            <Ionicons name="arrow-forward-circle" size={24} color="#000" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

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
        right: 12,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 36,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    ratingText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.bold,
        marginLeft: 4,
    },
    ratingSubtext: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginLeft: 4,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 12,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
    },
    benefitsSection: {
        marginBottom: 36,
        gap: 16,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        width: 24,
        height: 24,
    },
    benefitText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.regular,
        flex: 1,
    },
    plansSection: {
        gap: 12,
        marginBottom: 32,
    },
    planCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#fbbf24',
    },
    planCardSecondary: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    planCardSelectedSecondary: {
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    bestValueBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: '#7c3aed',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bestValueText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    planName: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    savingsBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    savingsText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
    planPrice: {
        color: '#fff',
        fontSize: 28,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    planDuration: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16,
        fontFamily: FONTS.regular,
    },
    dailyCost: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: FONTS.regular,
        marginBottom: 8,
    },
    trialText: {
        color: '#10b981',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontFamily: FONTS.regular,
    },
    finePrint: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 14,
    },
    ctaContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        paddingTop: 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
        elevation: 8,
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
    },
    ctaText: {
        color: '#000',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    restoreButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    restoreText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
});
