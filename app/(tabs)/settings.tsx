import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/components/AuthGuard';
import { colors } from '@/constants/colors';
import { exportToCsv } from '@/utils/export-to-csv';
import { fetchCars } from '@/lib/supabaseClient';
import { 
  Moon, 
  Sun, 
  FileText, 
  Trash2, 
  HelpCircle, 
  Info, 
  Shield,
  Smartphone,
  Laptop,
  LogOut
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useSettingsStore();
  const { signOut, loading } = useAuthStore();
  
  const theme = darkMode ? colors.dark : colors.light;
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const cars = await fetchCars();
      
      if (cars.length === 0) {
        Alert.alert(
          "No Data",
          "You don't have any cars in your inventory to export."
        );
        return;
      }
      
      const success = await exportToCsv(cars);
      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(
          "Export Successful",
          "Your car inventory has been exported to CSV."
        );
      } else {
        Alert.alert(
          "Export Failed",
          "There was an error exporting your data."
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        "Export Failed",
        "There was an error exporting your data."
      );
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your inventory data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: () => {
            // This would need to be implemented in the car store
            Alert.alert(
              "Feature Coming Soon",
              "This feature will be available in the next update."
            );
          }
        }
      ]
    );
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Appearance
        </Text>
        
        <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            {darkMode ? (
              <Moon size={22} color={theme.text} style={styles.settingIcon} />
            ) : (
              <Sun size={22} color={theme.text} style={styles.settingIcon} />
            )}
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Data Management
        </Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color={theme.primary} style={styles.actionIcon} />
          ) : (
            <FileText size={22} color={theme.primary} style={styles.actionIcon} />
          )}
          <Text style={[styles.actionText, { color: theme.text }]}>
            {exportLoading ? 'Exporting...' : 'Export as CSV'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={handleClearData}
        >
          <Trash2 size={22} color={theme.danger} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Device Sync
        </Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => Alert.alert("Multi-Device Sync", "This feature will be available in a future update.")}
        >
          <Smartphone size={22} color={theme.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Multi-Device Sync
          </Text>
          <View style={[styles.disabledBadge, { backgroundColor: theme.border }]}>
            <Text style={styles.disabledText}>COMING SOON</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => Alert.alert("Web Access", "This feature will be available in a future update.")}
        >
          <Laptop size={22} color={theme.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Access from Web Browser
          </Text>
          <View style={[styles.disabledBadge, { backgroundColor: theme.border }]}>
            <Text style={styles.disabledText}>COMING SOON</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Support
        </Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => setHelpModalVisible(true)}
        >
          <HelpCircle size={22} color={theme.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Help & FAQ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => setAboutModalVisible(true)}
        >
          <Info size={22} color={theme.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            About AM Motors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => Alert.alert("Privacy Policy", "AM Motors does not collect any personal data. All your inventory data is stored securely in your Supabase account.")}
        >
          <Shield size={22} color={theme.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: theme.danger }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <LogOut size={22} color="white" style={styles.buttonIcon} />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>About AM Motors</Text>
            
            <ScrollView style={styles.aboutScrollView}>
              <Text style={[styles.aboutText, { color: theme.text }]}>
                Our founder's journey began with humble roots — charging street scooters to earn some extra cash. He then worked at Walmart, saved up, and gave dropshipping a try, but ended up losing $2–3K on power banks. Around this time, he also made a major life decision: switching his major from Chemical Engineering to Finance, driven by a deep interest in business and entrepreneurship.
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.text, marginTop: 12 }]}>
                Later, he ventured into stock trading and made some money, but couldn't sustain it due to the market's volatility. While trying for an internship located far from home, he bought a used Honda Civic for $11K. The car kept breaking down, and as he fixed it himself, he discovered a new passion.
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.text, marginTop: 12 }]}>
                From that point on, unemployed but inspired, he began buying old cars, fixing them, and reselling them — turning a personal struggle into a business opportunity. What started as a necessity evolved into a passion project.
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.text, marginTop: 12 }]}>
                Today, AM Motors thrives on that same spirit of hustle, self-learning, and love for the process — flipping auction cars and building a brand that was truly born different. So far, AM Motors has made $50K in profit and is on the road to $100K and beyond.
              </Text>
              
              <View style={styles.versionInfo}>
                <Text style={[styles.versionLabel, { color: theme.subtext }]}>Version</Text>
                <Text style={[styles.versionValue, { color: theme.text }]}>1.0.0</Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Help Modal */}
      <Modal
        visible={helpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Help & FAQ</Text>
            
            <ScrollView style={styles.faqScrollView}>
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  How do I add a new car?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Tap the + button in the bottom right corner of the inventory screen to add a new car.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  How do I mark a car as sold?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Open the car details and tap "Mark as Sold" at the bottom of the screen. Enter the selling price to calculate profit/loss.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  How do I add expenses to a car?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Open the car details and tap "Add Expense" in the Expenses section. Enter the expense details.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  How do I export my inventory data?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Go to Settings and tap "Export as CSV" under Data Management.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  Is my data backed up?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Yes, all your data is securely stored in your Supabase account. You can access it from any device by signing in with the same account.
                </Text>
              </View>
              
              <View style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  How do I view a car's invoice?
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.subtext }]}>
                  Open the car details and tap "View Purchase Invoice" if an invoice has been attached.
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabledBadge: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disabledText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
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
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  aboutScrollView: {
    maxHeight: 400,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  versionInfo: {
    marginTop: 24,
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  faqScrollView: {
    maxHeight: 400,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
});