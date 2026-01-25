// src/components/home/XPProgressRing.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { FONTS } from '../../constants/theme';

interface XPProgressRingProps {
    currentXP: number;
    targetXP: number;
    currentLevel: string;
    nextLevel: string;
    size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const XPProgressRing: React.FC<XPProgressRingProps> = ({
    currentXP,
    targetXP,
    currentLevel,
    nextLevel,
    size = 80,
}) => {
    const progress = useRef(new Animated.Value(0)).current;

    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const progressPercent = Math.min(100, Math.max(0, (currentXP / targetXP) * 100));

    useEffect(() => {
        Animated.timing(progress, {
            toValue: progressPercent,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [progressPercent]);

    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Level text in center */}
            <View style={styles.centerContent}>
                <Text style={styles.levelText}>
                    {currentLevel}→{nextLevel}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
});
