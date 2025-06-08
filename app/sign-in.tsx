
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/components/AuthGuard';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignIn = async () => {
    if (!validate() || loading) return;
    
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again.');
    }
  };
  
  const navigateToSignUp = () => {
    router.push('/sign-up');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.primary }]}>AM MOTORS</Text>
          <Text style={[styles.tagline, { color: theme.subtext }]}>Car Inventory Management</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Sign In</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Mail size={20} color={theme.subtext} />
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.card,
                  borderColor: errors.email ? theme.danger : theme.border,
                  color: theme.text
                }
              ]}
              placeholder="Email"
              placeholderTextColor={theme.subtext}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.email}</Text>}
          
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color={theme.subtext} />
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.card,
                  borderColor: errors.password ? theme.danger : theme.border,
                  color: theme.text
                }
              ]}
              placeholder="Password"
              placeholderTextColor={theme.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.password}</Text>}
          
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <LogIn size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.signInButtonText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={[styles.signUpText, { color: theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 50,
  },
  signInButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
  },
});