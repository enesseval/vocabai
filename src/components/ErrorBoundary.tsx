/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Error Boundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <LinearGradient colors={['#1e1b4b', '#000']} style={StyleSheet.absoluteFill} />
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="alert-circle" size={64} color="#FF5C5C" />
              </View>

              {/* Error Message */}
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.message}>
                We encountered an unexpected error. Don't worry, your data is safe. Try restarting the app.
              </Text>

              {/* Error Details (Development only) */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                  <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                </View>
              )}

              {/* Reset Button */}
              <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
                <Text style={styles.resetButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Merriweather-Bold',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  errorDetails: {
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5C5C',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    fontSize: 12,
    color: 'rgba(255, 92, 92, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  resetButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
