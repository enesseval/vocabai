// src/components/paywall/PlanCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../constants/theme';

interface PlanCardProps {
    name: string;
    price: string;
    pricePerMonth?: string;
    duration: string;
    savings?: string;
    isBestValue?: boolean;
    isSelected: boolean;
    onSelect: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
    name,
    price,
    pricePerMonth,
    duration,
    savings,
    isBestValue,
    isSelected,
    onSelect,
}) => {
    const handleSelect = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
    };

    return (
        <TouchableOpacity onPress={handleSelect} activeOpacity={0.7} style={styles.touchable}>
            {/* Best Value Badge - Outside BlurView */}
            {isBestValue && (
                <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
            )}

            <BlurView
                intensity={20}
                tint="dark"
                style={[styles.card, isSelected && styles.cardSelected, isBestValue && styles.cardWithBadge]}
            >
                {/* Savings Badge */}
                {savings && (
                    <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>SAVE {savings}</Text>
                    </View>
                )}

                <View style={styles.content}>
                    {/* Radio Button */}
                    <View style={styles.radioContainer}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                            {isSelected && (
                                <View style={styles.radioInner}>
                                    <Ionicons name="checkmark" size={14} color="#000" />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Plan Info */}
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>{name}</Text>
                        <Text style={styles.trialText}>7-day free trial</Text>
                    </View>

                    {/* Pricing */}
                    <View style={styles.pricingContainer}>
                        <Text style={styles.planPrice}>{price}</Text>
                        {pricePerMonth && (
                            <Text style={styles.pricePerMonthText}>{pricePerMonth}/mo</Text>
                        )}
                        <Text style={styles.billingText}>
                            {duration === 'year' ? 'Billed annually' : 'Billed monthly'}
                        </Text>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        position: 'relative',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden', // Fix border radius clipping
    },
    cardWithBadge: {
        marginTop: 12, // Space for badge
    },
    cardSelected: {
        borderColor: '#fbbf24',
        borderWidth: 3,
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
    },
    bestValueBadge: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        backgroundColor: '#7c3aed',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    bestValueText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    savingsBadge: {
        position: 'absolute',
        top: 8,
        left: 16,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        zIndex: 5,
    },
    savingsText: {
        color: '#fbbf24',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
    content: {
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
    pricePerMonthText: {
        color: '#fbbf24',
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        marginBottom: 2,
    },
    billingText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
});
