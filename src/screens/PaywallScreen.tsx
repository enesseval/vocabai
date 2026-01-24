// src/screens/PaywallScreen.tsx

import React, { useState, useEffect } from 'react';
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

type PlanOption = {
    id: SubscriptionPlan;
    nameKey: string;
    price: string;
    pricePerMonth?: string;
    duration: string;
    savings?: string;
    isBestValue?: boolean;
};

export default function PaywallScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { updateSubscription } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');

    // Entrance animation
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const plans: PlanOption[] = [
        {
            id: 'monthly',
            nameKey: 'paywall.planMonthly',
            price: '₺199',
            duration: t('paywall.month'),
            pricePerMonth: '₺199',
        },
        {
            id: 'yearly',
            nameKey: 'paywall.planYearly',
            price: '₺1,199',
            pricePerMonth: '₺99',
            duration: t('paywall.year'),
            savings: '50%',
            isBestValue: true,
        },
    ];

    const handleSubscribe = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await updateSubscription(selectedPlan);
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    const handleRestore = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Implement restore purchases
    };

    const openPrivacy = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open privacy policy
    };

    const openTerms = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open terms
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 }
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Plans and pricing</Text>
                    <Text style={styles.subtitle}>VocabAI Premium</Text>
                </View>

                {/* Choose Duration */}
                <Text style={styles.sectionTitle}>Choose your duration:</Text>

                {/* Plan Cards */}
                <View style={styles.plansContainer}>
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <TouchableOpacity
                                key={plan.id}
                                onPress={() => {
                                    setSelectedPlan(plan.id);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                activeOpacity={0.7}
                            >
                                <BlurView
                                    intensity={20}
                                    tint="dark"
                                    style={[
                                        styles.planCard,
                                        isSelected && styles.planCardSelected
                                    ]}
                                >
                                    {/* Best Value Badge */}
                                    {plan.isBestValue && (
                                        <View style={styles.bestValueBadge}>
                                            <Text style={styles.bestValueText}>BEST VALUE</Text>
                                        </View>
                                    )}

                                    {/* Savings Badge */}
                                    {plan.savings && (
                                        <View style={styles.savingsBadge}>
                                            <Text style={styles.savingsText}>SAVE {plan.savings}</Text>
                                        </View>
                                    )}

                                    <View style={styles.planContent}>
                                        {/* Radio Button */}
                                        <View style={styles.radioContainer}>
                                            <View style={[
                                                styles.radioOuter,
                                                isSelected && styles.radioOuterSelected
                                            ]}>
                                                {isSelected && (
                                                    <View style={styles.radioInner}>
                                                        <Ionicons name="checkmark" size={14} color="#000" />
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {/* Plan Info */}
                                        <View style={styles.planInfo}>
                                            <Text style={styles.planName}>
                                                {plan.id === 'monthly' ? '1 month' : '12 months'}
                                            </Text>
                                            <Text style={styles.trialText}>7-day free trial</Text>
                                        </View>

                                        {/* Pricing */}
                                        <View style={styles.pricingContainer}>
                                            <Text style={styles.planPrice}>{plan.price}</Text>
                                            <Text style={styles.billingText}>
                                                {plan.id === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                                            </Text>
                                        </View>
                                    </View>
                                </BlurView>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={handleSubscribe}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#fbbf24', '#f59e0b']}
                        style={styles.ctaGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.ctaText}>Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Links */}
                <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={openPrivacy}>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openTerms}>
                        <Text style={styles.linkText}>Terms and Conditions</Text>
                    </TouchableOpacity>
                </View>

                {/* Included Features */}
                <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Included with your membership:</Text>

                    <View style={styles.featuresList}>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#fbbf24" />
                            <Text style={styles.featureText}>{t('paywall.benefit1')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#fbbf24" />
                            <Text style={styles.featureText}>{t('paywall.benefit2')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#fbbf24" />
                            <Text style={styles.featureText}>{t('paywall.benefit3')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#fbbf24" />
                            <Text style={styles.featureText}>{t('paywall.benefit4')}</Text>
                        </View>
                    </View>
                </View>

                {/* Restore Purchases */}
                <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
                </TouchableOpacity>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontFamily: FONTS.bold,
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 20,
        fontFamily: FONTS.semiBold,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        marginBottom: 16,
    },
    plansContainer: {
        gap: 16,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden',
    },
    planCardSelected: {
        borderColor: '#fbbf24',
        borderWidth: 3,
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
    },
    bestValueBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: [{ translateX: -45 }],
        backgroundColor: '#7c3aed',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 1,
    },
    bestValueText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    savingsBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    savingsText: {
        color: '#fbbf24',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    planContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    radioContainer: {
        justifyContent: 'center',
    },
    radioOuter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    radioOuterSelected: {
        borderColor: '#fbbf24',
        backgroundColor: '#fbbf24',
    },
    radioInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    trialText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    pricingContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        color: '#fff',
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    billingText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    ctaButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#000',
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    linksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 32,
    },
    linkText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    featuresSection: {
        marginBottom: 24,
    },
    featuresTitle: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        marginBottom: 16,
    },
    featuresList: {
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontFamily: FONTS.regular,
        flex: 1,
    },
    restoreButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    restoreText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
});
