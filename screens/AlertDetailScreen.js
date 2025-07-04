import { StyleSheet, Text, View, Pressable, Alert, ScrollView, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AUTH_ENDPOINTS, ALERT_ENDPOINTS } from '../config/apiConfig';

function AlertDetailScreen() {
    const route = useRoute();
    const { alert } = route.params;
    const navigation = useNavigation();
    const [isCreator, setIsCreator] = useState(false);
    const [userId, setUserId] = useState(null);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        const checkIfCreator = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(AUTH_ENDPOINTS.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setUserId(response.data._id);
                setIsCreator(response.data._id === alert.userID);
                
                // Format the date if available
                if (alert.createdAt) {
                    const date = new Date(alert.createdAt);
                    setFormattedDate(date.toLocaleString());
                }
            } catch (error) {
                console.error("Error checking creator status:", error);
            }
        };

        checkIfCreator();
    }, [alert]);

    const handleResolveAlert = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            await axios.put(
                ALERT_ENDPOINTS.UPDATE(alert._id),
                { status: 'resolved' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            Alert.alert(
                "Alert Resolved", 
                "The alert has been marked as resolved.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Error resolving alert:", error);
            Alert.alert("Error", "Failed to resolve the alert");
        }
    };

    const openLocationOnMap = () => {
        if (!alert.location || !alert.location.latitude || !alert.location.longitude) {
            Alert.alert("Location Unavailable", "No location data is available for this alert.");
            return;
        }
        
        // Format the location link for Google Maps
        const { latitude, longitude } = alert.location;
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        
        // Open the link in the device's browser
        Linking.openURL(url).catch(err => {
            Alert.alert("Error", "Could not open map application");
        });
    };

    const hasLocation = alert.location && alert.location.latitude && alert.location.longitude;

    return (
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Alert Details</Text>
                    <View style={[
                        styles.statusBadge, 
                        alert.status === 'resolved' ? styles.resolvedBadge : styles.activeBadge
                    ]}>
                        <Text style={styles.statusText}>
                            {alert.status ? alert.status.toUpperCase() : 'ACTIVE'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.label}>Created By:</Text>
                    <Text style={styles.value}>
                        {userId === alert.userID ? 'You' : alert.name}
                    </Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.label}>Created On:</Text>
                    <Text style={styles.value}>
                        {formattedDate || 'Unknown date'}
                    </Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.label}>Alert Message:</Text>
                    <Text style={styles.messageText}>{alert.message}</Text>
                </View>
                
                <View style={styles.tagsContainer}>
                    <Text style={styles.label}>Tags:</Text>
                    <View style={styles.tagsList}>
                        {alert.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {hasLocation && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Location:</Text>
                        <Pressable 
                            style={styles.mapButton}
                            onPress={openLocationOnMap}
                        >
                            <Ionicons name="location" size={24} color="white" />
                            <Text style={styles.mapButtonText}>View on Map</Text>
                        </Pressable>
                    </View>
                )}
                
                {isCreator && alert.status !== 'resolved' && (
                    <Pressable 
                        style={styles.resolveButton}
                        onPress={handleResolveAlert}
                    >
                        <Text style={styles.resolveButtonText}>Resolve Alert</Text>
                    </Pressable>
                )}
                
                <View style={styles.footerPadding} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: '#ff4040',
    },
    resolvedBadge: {
        backgroundColor: '#4caf50',
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
    },
    messageText: {
        fontSize: 18,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tagsContainer: {
        marginBottom: 30,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    tag: {
        backgroundColor: 'orange',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: {
        color: 'white',
        fontWeight: '500',
    },
    mapButton: {
        backgroundColor: '#2196f3',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    mapButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    resolveButton: {
        backgroundColor: '#2196f3',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    resolveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerPadding: {
        height: 40,
    }
});
      
export default AlertDetailScreen;
