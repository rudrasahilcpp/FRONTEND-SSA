import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AlertCard from '../components/AlertCard';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ALERT_ENDPOINTS } from '../config/apiConfig';

function ExploreScreen() {
  const [alerts, setAlert] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(ALERT_ENDPOINTS.GET_ALL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter to show only active alerts in the main screen
      const activeAlerts = response.data.filter(alert => alert.status !== 'resolved');
      setAlert(activeAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const navigateToResolvedAlerts = () => {
    navigation.navigate('ResolvedAlerts');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.Container}>
      <Text style={styles.header}>Active Alerts</Text>
      
      <FlatList 
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AlertCard 
            Name={item.name} 
            Tag={item.tags.join(", ")}
            alert={item}
            navigation={navigation} 
          />
        )}
        refreshing={refreshing}   
        onRefresh={fetchData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active alerts to display</Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 100, // Make room for the button at the bottom
        }}
      />
      
      <TouchableOpacity 
        style={styles.resolvedButton}
        onPress={navigateToResolvedAlerts}
      >
        <Text style={styles.resolvedButtonText}>Resolved Alerts</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  resolvedButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  resolvedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ExploreScreen;
