import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { CarCard } from '@/components/CarCard';
import { StatsCard } from '@/components/StatsCard';
import { Plus, Search, X } from 'lucide-react-native';
import { Car } from '@/types/car';
import { fetchCars, getInventoryStats } from '@/lib/supabaseClient';

export default function InventoryScreen() {
  const router = useRouter();
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  const [cars, setCars] = useState<Car[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    soldCars: 0,
    inventoryCars: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageProfit: 0,
    totalBookValue: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  
  // Fetch cars and stats
  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedCars = await fetchCars();
      setCars(fetchedCars);
      
      const inventoryStats = await getInventoryStats();
      setStats(inventoryStats);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, []);
  
  // Filter cars based on search query
  const filteredCars = cars.filter(car => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      car.make.toLowerCase().includes(query) || 
      car.model.toLowerCase().includes(query) ||
      car.year.toString().includes(query)
    );
  });
  
  // Show all cars, sorted by creation date (newest first)
  const sortedCars = [...filteredCars].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);
  
  const navigateToCarDetails = (car: Car) => {
    router.push({
      pathname: '/car-details',
      params: { id: car.id }
    });
  };
  
  const navigateToAddCar = () => {
    router.push('/add-car');
  };
  
  const toggleSearch = () => {
    if (showSearch) {
      hideSearch();
    } else {
      showSearchBar();
    }
  };
  
  const showSearchBar = () => {
    setShowSearch(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      searchInputRef.current?.focus();
    });
  };
  
  const hideSearch = () => {
    Keyboard.dismiss();
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowSearch(false);
      setSearchQuery('');
    });
  };
  
  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Loading inventory...
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        {searchQuery ? (
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            No cars found matching "{searchQuery}"
          </Text>
        ) : (
          <Text style={[styles.emptyText, { color: theme.subtext }]}>
            Your inventory is empty. Add your first car!
          </Text>
        )}
        
        {!searchQuery && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={navigateToAddCar}
          >
            <Text style={styles.addButtonText}>Add Your First Car</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <TouchableWithoutFeedback onPress={showSearch ? hideSearch : undefined}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen 
          options={{
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
                  <Search size={22} color={theme.text} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        
        {showSearch && (
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.searchContainer, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  opacity: searchAnimation,
                  transform: [
                    { 
                      translateY: searchAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <Search size={20} color={theme.subtext} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search by make, model, or year"
                placeholderTextColor={theme.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={theme.subtext} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={hideSearch}>
                  <X size={20} color={theme.subtext} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        )}
        
        <FlatList
          data={sortedCars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CarCard car={item} onPress={() => navigateToCarDetails(item)} />
          )}
          ListHeaderComponent={
            <StatsCard stats={stats} />
          }
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
        
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={navigateToAddCar}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});