import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { ALERT_ENDPOINTS } from '../config/apiConfig';

function HomeScreen({navigation}) {
    const [isHolding, setIsHolding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);
    const longPressTimeoutRef = useRef(null);
    
    // Request location permissions when the component mounts
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationStatus(status);
            
            if (status !== 'granted') {
                Alert.alert(
                    "Location Permission Required",
                    "Location permission is needed to send your position with emergency alerts.",
                    [{ text: "OK" }]
                );
            }
        })();
    }, []);
    
    // Function to handle press start
    const handlePressIn = () => {
        setIsHolding(true);
        
        // Set a timeout for 2 seconds to trigger emergency alert
        longPressTimeoutRef.current = setTimeout(() => {
            sendEmergencyAlert();
        }, 2000); // 2 seconds hold time
    };
    
    // Function to handle press end
    const handlePressOut = () => {
        setIsHolding(false);
        
        // Clear the timeout if released before 2 seconds
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };
    
    // Function to handle normal tap
    const handlePress = () => {
        // Only navigate to AlertMenu on a quick tap (not after a long press)
        if (!isLoading && !longPressTimeoutRef.current) {
            // Navigate directly to AlertMenu screen
            navigation.navigate('AlertMenu');
        }
    };
    
    // Get current location
    const getCurrentLocation = async () => {
        if (locationStatus !== 'granted') {
            return null;
        }
        
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
        } catch (error) {
            console.error("Error getting location:", error);
            return null;
        }
    };
    
    // Function to send emergency alert
    const sendEmergencyAlert = async () => {
        try {
            setIsLoading(true);
            
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found");
            }
            
            // Get current location
            const location = await getCurrentLocation();
            
            // Send emergency alert with HIGH priority and location if available
            const alertData = {
                message: "Emergency SOS",
                tags: ['HIGH']
            };
            
            if (location) {
                alertData.location = location;
            }
            
            const response = await axios.post(
                ALERT_ENDPOINTS.CREATE,
                alertData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            Alert.alert(
                "Emergency Alert Sent", 
                location 
                    ? "Your emergency alert with location has been sent to all your contacts."
                    : "Your emergency alert has been sent to all your contacts.",
                [{ text: "OK" }]
            );
            
            // Navigate to the explore screen
            navigation.navigate("ExploreStack", { screen: "Explore" });
            
        } catch (error) {
            console.error("Error sending emergency alert:", error);
            Alert.alert("Error", "Failed to send emergency alert. Please try again.");
        } finally {
            setIsLoading(false);
            setIsHolding(false);
        }
    };
    
    return(
        <View style={styles.Container}>
            <Text style={styles.Text}>Emergency Alert</Text>
            
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Sending alert...</Text>
                </View>
            ) : (
                <TouchableOpacity 
                    style={[styles.sosButton, isHolding && styles.sosButtonPressed]} 
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.7}
                >
                    <Text style={styles.sosText}>SOS</Text>
                    {isHolding && (
                        <Text style={styles.holdText}>Keep holding to send emergency alert</Text>
                    )}
                </TouchableOpacity>
            )}
            
            <Text style={styles.helperText}>
                {isHolding ? 
                    "Hold for 2 seconds to send emergency alert" : 
                    "Tap the SOS button for options or hold for 2 seconds for immediate alert"}
            </Text>
            
            {locationStatus !== 'granted' && (
                <Text style={styles.warningText}>
                    Location permission not granted. Your location will not be shared with alerts.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    Text: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 60,
    },
    sosButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    sosButtonPressed: {
        backgroundColor: '#cc0000', // Darker red when pressed
        transform: [{ scale: 0.95 }], // Slightly smaller when pressed
    },
    sosText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    helperText: {
        fontSize: 16,
        marginTop: 40,
        color: '#555',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    warningText: {
        fontSize: 14,
        marginTop: 15,
        color: 'red',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    holdText: {
        fontSize: 12,
        color: 'white',
        marginTop: 10,
        textAlign: 'center',
        width: '80%',
    },
    loaderContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: 'white',
        marginTop: 10,
    }
})

export default HomeScreen;