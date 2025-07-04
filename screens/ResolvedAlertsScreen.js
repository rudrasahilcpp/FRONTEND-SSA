import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AlertCard from '../components/AlertCard';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ALERT_ENDPOINTS } from '../config/apiConfig';

function ResolvedAlertsScreen() {
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchResolvedData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const response = await axios.get(ALERT_ENDPOINTS.GET_ALL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Filter to show only resolved alerts
      const resolved = response.data.filter(alert => alert.status === 'resolved');
      setResolvedAlerts(resolved);
    } catch (error) {
      console.error("Error fetching resolved alerts:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolvedData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Resolved Alerts</Text>
      </View>
      
      <FlatList 
        data={resolvedAlerts}
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
        onRefresh={fetchResolvedData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No resolved alerts to display</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default ResolvedAlertsScreen; 