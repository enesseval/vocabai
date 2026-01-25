import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import HomeScreen from '../screens/HomeScreen';
import StoriesScreen from '../screens/StoriesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import WordsScreen from '../screens/WordsScreen';
import CustomTabBar from '../components/CustomTabBar';
import { RootStackParamList } from '../types/navigation';
import { FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();

// Context for header content
interface HeaderContextType {
    setHeaderLeft: (content: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) throw new Error('useHeader must be used within HeaderProvider');
    return context;
};

// Global header component with dynamic left content
function GlobalHeader({ children }: { children: ReactNode }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const [headerLeft, setHeaderLeft] = useState<ReactNode>(null);

    const handleProfilePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('Profile' as any);
    };

    return (
        <HeaderContext.Provider value={{ setHeaderLeft }}>
            {/* Global Header with Background */}
            <View style={[styles.headerContainer, { paddingVertical: insets.top + 0 }]}>
                {/* Solid Background */}
                <View style={styles.headerBackground} />

                {/* Blur Effect */}
                 <BlurView intensity={40} tint="dark" style={[styles.headerBlur,{height:insets.top + 65}]} /> 

                {/* Bottom Border */}
                <View style={styles.headerBorder} />

                {/* Header Content */}
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        {headerLeft}
                    </View>
                    <TouchableOpacity
                        onPress={handleProfilePress}
                        activeOpacity={0.8}
                    >
                        <BlurView intensity={30} tint="dark" style={styles.profileButton}>
                            <Ionicons name="person-circle" size={28} color="#fbbf24" />
                        </BlurView>
                    </TouchableOpacity>
                </View>
            </View>
            {children}
        </HeaderContext.Provider>
    );
}

export default function TabNavigator() {
    return (
        <GlobalHeader>
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                }}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
                    }}
                />
                <Tab.Screen
                    name="StoriesTab"
                    component={StoriesScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />
                    }}
                />
                <Tab.Screen
                    name="WordsTab"
                    component={WordsScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />
                    }}
                />
                <Tab.Screen
                    name="ProgressTab"
                    component={ProgressScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
                    }}
                />
            </Tab.Navigator>
        </GlobalHeader>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingBottom:15,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'transparent',
    },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerBorder: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 0,
        zIndex: 10,
    },
    headerLeft: {
        flex: 1,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderWidth: 1,
        borderColor: 'rgba(251, 189, 35, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        shadowColor: '#fbbf24',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
});
