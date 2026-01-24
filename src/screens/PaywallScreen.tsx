// src/screens/PaywallScreen.tsx

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
                colors={['#ffffff', '#f8f9fa', '#e0e7ff']}
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
                                <View style={[
                                    styles.planCard,
                                    isSelected && styles.planCardSelected
                                ]}>
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
                                                        <Ionicons name="checkmark" size={14} color="#fff" />
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
                                </View>
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
                    <Text style={styles.ctaText}>Continue</Text>
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
                            <Ionicons name="checkmark" size={20} color="#6366f1" />
                            <Text style={styles.featureText}>{t('paywall.benefit1')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#6366f1" />
                            <Text style={styles.featureText}>{t('paywall.benefit2')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#6366f1" />
                            <Text style={styles.featureText}>{t('paywall.benefit3')}</Text>
                        </View>
                        <View style={styles.featureRow}>
                            <Ionicons name="checkmark" size={20} color="#6366f1" />
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
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        color: '#1e1b4b',
        fontSize: 32,
        fontFamily: FONTS.bold,
        marginBottom: 8,
    },
    subtitle: {
        color: '#1e1b4b',
        fontSize: 20,
        fontFamily: FONTS.semiBold,
    },
    sectionTitle: {
        color: '#1e1b4b',
        fontSize: 18,
        fontFamily: FONTS.semiBold,
        marginBottom: 16,
    },
    plansContainer: {
        gap: 16,
        marginBottom: 24,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        position: 'relative',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Shadow for Android
        elevation: 2,
    },
    planCardSelected: {
        borderColor: '#6366f1',
        borderWidth: 3,
        backgroundColor: '#fafafa',
    },
    bestValueBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: [{ translateX: -45 }],
        backgroundColor: '#1e1b4b',
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
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    savingsText: {
        color: '#6366f1',
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
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    radioOuterSelected: {
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
    },
    radioInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        color: '#1e1b4b',
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 4,
    },
    trialText: {
        color: '#6b7280',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    pricingContainer: {
        alignItems: 'flex-end',
    },
    planPrice: {
        color: '#1e1b4b',
        fontSize: 24,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    billingText: {
        color: '#6b7280',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    ctaButton: {
        backgroundColor: '#6366f1',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 20,
        // Shadow for iOS
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        // Shadow for Android
        elevation: 4,
    },
    ctaText: {
        color: '#fff',
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
        color: '#6366f1',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    featuresSection: {
        marginBottom: 24,
    },
    featuresTitle: {
        color: '#1e1b4b',
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
        color: '#374151',
        fontSize: 16,
        fontFamily: FONTS.regular,
        flex: 1,
    },
    restoreButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    restoreText: {
        color: '#6b7280',
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
});
