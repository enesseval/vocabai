import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const { width, height } = Dimensions.get('window');

const COLORS = {
    bg: '#050406',
    primary: '#7c3aed',
    glow: '#a78bfa',
    text: '#ffffff',
    accent: '#fbbf24',
};

// --- RENK PALETİ ---
const PARTICLE_COLORS = [
    '#FFFFFF',              // Beyaz (Standart)
    '#52525b',              // Gri (Derinlik)
    'rgba(255, 215, 0, 0.7)' // ALTIN SARISI (Alpha'yı artırdım ki animasyonda "ben buradayım" desin)
];

// --- HAREKETLİ TOZ ZERRESİ ---
const FloatingParticle = ({ initialTop, left, size, color }: { initialTop: number, left: number, size: number, color: string }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Bu parçacık "Özel Sarı" mı kontrol et
    const isGold = color.includes('255, 215, 0');

    useEffect(() => {
        // 1. YÜKSELME (Hepsi için aynı ahenk)
        const duration = 20000 + Math.random() * 20000;

        Animated.loop(
            Animated.timing(floatAnim, {
                toValue: 1,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // 2. YANIP SÖNME (Twinkle) - MANTIK BURADA DEĞİŞİYOR
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    // Sarıysa TAM PARLASIN (1.0), diğerleri sönük kalsın (0.5)
                    toValue: isGold ? 0.7 : 0.3,
                    duration: isGold ? 2000 : 3000, // Sarılar biraz daha hızlı tepki versin
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    // Sarıysa neredeyse tamamen sönsün (dramatik etki), diğerleri hafif kısılsın
                    toValue: isGold ? 0.1 : 0.1,
                    duration: isGold ? 2000 : 3000,
                    useNativeDriver: true
                }),
            ])
        ).start();
    }, []);

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -height - 100],
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: left,
                    top: initialTop,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    opacity: opacityAnim,
                    transform: [{ translateY }],
                    // Sarıysa ona ekstra bir gölge (glow) verelim ki parlasın
                    shadowColor: isGold ? '#ffd700' : 'transparent',
                    shadowOpacity: isGold ? 1 : 0,
                    shadowRadius: isGold ? 4 : 0,
                },
            ]}
        />
    );
};

export default function WelcomeScreen() {
    // 100 ADET PARÇACIK
    const particles = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * width,
        initialTop: Math.random() * height * 1.5,
        size: Math.random() * 2.5 + 0.5,
        // Renkleri rastgele ata
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* BACKGROUND */}
            <LinearGradient
                colors={['#1e1b4b', '#020203', '#000']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
            />


            {/* PARTICLES */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles.map((p) => (
                    <FloatingParticle
                        key={p.id}
                        initialTop={p.initialTop}
                        left={p.left}
                        size={p.size}
                        color={p.color}
                    />
                ))}
            </View>

            <SafeAreaView style={styles.safeArea}>

                {/* --- ORTA KISIM --- */}
                <View style={styles.centerContent}>

                    <View style={styles.logoStage}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.title}>VocabAI</Text>

                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
                            style={styles.verticalLine}
                        />

                        <Text style={styles.subtitle}>
                            ZİHNİNİZ İÇİN <Text style={styles.italicText}>özel</Text> SEÇKİ
                        </Text>
                    </View>
                </View>

                {/* --- ALT KISIM --- */}
                <View style={styles.bottomSection}>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.outlineButtonWrapper}
                        onPress={() => navigation.navigate('Identity')}
                    >
                        <View style={styles.buttonGlowEffect} />

                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'transparent', 'rgba(255,255,255,0.1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.outlineGradient}
                        >
                            <Text style={styles.buttonText}>BAŞLA</Text>

                            <View style={styles.absoluteIcon}>
                                <Text style={styles.arrowIcon}>→</Text>
                            </View>
                        </LinearGradient>

                        <LinearGradient
                            colors={['transparent', '#fff', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.techLineTop}
                        />

                        <LinearGradient
                            colors={['transparent', '#fff', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.techLineBottom}
                        />

                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginBtn}>
                        <Text style={styles.loginText}>
                            ZATEN ÜYE MİSİNİZ? <Text style={{ color: '#fff', fontWeight: 'bold' }}>GİRİŞ YAP</Text>
                        </Text>
                    </TouchableOpacity>

                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    logoStage: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        width: width * 0.6,
        height: width * 0.6,
        position: 'relative',
    },
    logo: {
        width: '100%',
        height: '100%',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    textWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 48,
        color: COLORS.text,
        fontFamily: 'PlayfairDisplay-Bold',
        letterSpacing: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(124, 58, 237, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    verticalLine: {
        width: 1.5,
        height: 60,
        marginVertical: 12,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    italicText: {
        fontFamily: 'PlayfairDisplay-Regular',
        fontStyle: 'italic',
        color: '#fff',
        textTransform: 'lowercase',
        fontSize: 14,
    },
    bottomSection: {
        paddingHorizontal: 40,
        paddingBottom: 50,
        alignItems: 'center',
        gap: 24,
    },
    outlineButtonWrapper: {
        width: '100%',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonGlowEffect: {
        position: 'absolute',
        width: '80%',
        height: 20,
        backgroundColor: 'transparent',
        opacity: 0.3,
        top: 22,
    },
    outlineGradient: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    techLineTop: {
        position: 'absolute',
        top: 0,
        width: '50%',
        height: 2,
        shadowColor: '#fff',
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    techLineBottom: {
        position: 'absolute',
        bottom: 0,
        width: '50%',
        height: 2,
        shadowColor: '#fff',
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        letterSpacing: 6,
        fontWeight: '600',
        textAlign: 'center',
    },
    absoluteIcon: {
        position: 'absolute',
        right: 24,
    },
    arrowIcon: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '300',
        textShadowColor: '#fff',
        textShadowRadius: 5,
    },
    loginBtn: {
        padding: 5,
    },
    loginText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 11,
        fontFamily: 'Inter-SemiBold',
        letterSpacing: 1.5,
    },
});