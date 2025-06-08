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
  ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/components/AuthGuard';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { Mail, Lock, UserPlus, CheckCircle } from 'lucide-react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuthStore();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignUp = async () => {
    if (!validate() || loading) return;
    
    try {
      await signUp(email, password);
      setVerificationModalVisible(true);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please check your information and try again.');
    }
  };
  
  const navigateToSignIn = () => {
    router.push('/sign-in');
  };
  
  const handleVerificationComplete = () => {
    setVerificationModalVisible(false);
    router.replace('/sign-in');
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
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          
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
          
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color={theme.subtext} />
            </View>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.card,
                  borderColor: errors.confirmPassword ? theme.danger : theme.border,
                  color: theme.text
                }
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.subtext}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          {errors.confirmPassword && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.confirmPassword}</Text>}
          
          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: theme.primary }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <UserPlus size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={navigateToSignIn}>
              <Text style={[styles.signInText, { color: theme.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Email Verification Modal */}
      <Modal
        visible={verificationModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <CheckCircle size={60} color={theme.success} style={styles.modalIcon} />
            
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Verify Your Email
            </Text>
            
            <Text style={[styles.modalText, { color: theme.subtext }]}>
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleVerificationComplete}
            >
              <Text style={styles.modalButtonText}>
                Go to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  signUpButton: {
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
  signUpButtonText: {
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
  signInText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});