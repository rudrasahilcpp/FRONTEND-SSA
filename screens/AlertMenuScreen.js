import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, TextInput, Alert, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ALERT_ENDPOINTS } from '../config/apiConfig';

function AlertMenuScreen({ navigation }) {
    const [selectedTags, setSelectedTags] = useState([]);
    const [message, setMessage] = useState("");
    const [targetContact, setTargetContact] = useState(null);
    const [includeLocation, setIncludeLocation] = useState(true);
    const [locationStatus, setLocationStatus] = useState(null);
    
    const route = useRoute();
    
    // Request location permissions when the component mounts
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationStatus(status);
            
            if (status !== 'granted') {
                setIncludeLocation(false);
                Alert.alert(
                    "Location Permission Required",
                    "Location permission is needed to share your position with alerts.",
                    [{ text: "OK" }]
                );
            }
        })();
    }, []);
    
    // Check if a specific contact was passed from ContactScreen
    useEffect(() => {
        if (route.params?.targetContact) {
            setTargetContact(route.params.targetContact);
        }
    }, [route.params]);

    const handleTagPress = (tag) => {
        if (selectedTags.includes(tag)) {
            // Remove tag if already selected
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            // Add tag if not already selected and limit to 3 tags
            if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tag]);
            } else {
                Alert.alert("Tag limit reached", "You can only select up to 3 tags");
            }
        }
    };

    const isTagSelected = (tag) => {
        return selectedTags.includes(tag);
    };
    
    // Get current location
    const getCurrentLocation = async () => {
        if (locationStatus !== 'granted' || !includeLocation) {
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

    const submitAlert = async () => {
        if (selectedTags.length === 0) {
            Alert.alert("No tags selected", "Please select at least one tag");
            return;
        }

        if (!message.trim()) {
            Alert.alert("No message", "Please enter an alert message");
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            
            // Get location if user has opted in
            const location = await getCurrentLocation();
            
            // Prepare the alert data - include specificContact if targeting a single contact
            const alertData = {
                message: message,
                tags: selectedTags
            };
            
            // If a specific contact was selected, include it in the request
            if (targetContact) {
                alertData.specificContact = targetContact._id;
            }
            
            // Add location if available
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
            
            let alertMessage = "Your emergency alert has been sent";
            if (targetContact) {
                alertMessage = `Your alert has been sent to ${targetContact.name}`;
            }
            if (location) {
                alertMessage += " with your location";
            }
            
            Alert.alert("Alert Created", alertMessage);
            setSelectedTags([]);
            setMessage("");
            navigation.navigate('ExploreStack', { screen: 'Explore' });
        } catch (error) {
            console.log("Error creating alert", error);
            Alert.alert("Error", "Failed to create alert");
        }
    };

    const renderTagButton = (tag) => {
        return (
            <Pressable 
                onPress={() => handleTagPress(tag)}
                style={[
                    styles.tagButton,
                    isTagSelected(tag) && styles.selectedTagButton
                ]}
            >
                <Text style={[
                    styles.tagText,
                    isTagSelected(tag) && styles.selectedTagText
                ]}>
                    {tag}
                </Text>
            </Pressable>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.Container}>
                <Text style={styles.title}>
                    {targetContact 
                        ? `Send Alert to ${targetContact.name}` 
                        : 'Create Emergency Alert'}
                </Text>
                
                <View style={styles.messageContainer}>
                    <Text style={styles.label}>Alert Message:</Text>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Describe your emergency..."
                        multiline={true}
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />
                </View>
                
                <Text style={styles.label}>Select up to 3 tags:</Text>
                <Text style={styles.tagCount}>Selected: {selectedTags.length}/3</Text>
                
                <View style={styles.view}>
                    {renderTagButton('LOW')}
                    {renderTagButton('MEDIUM')}
                    {renderTagButton('HIGH')}
                </View>
                <View style={styles.view}>
                    {renderTagButton('PHYSICAL')}
                    {renderTagButton('MENTAL')}
                    {renderTagButton('MEDICAL')}
                </View>
                <View style={styles.view}>
                    {renderTagButton('STUDENT')}
                    {renderTagButton('STAFF')}
                    {renderTagButton('EXTERNAL')}
                </View>
                
                {locationStatus === 'granted' && (
                    <View style={styles.locationContainer}>
                        <Text style={styles.label}>Include your location:</Text>
                        <View style={styles.switchContainer}>
                            <Switch
                                value={includeLocation}
                                onValueChange={setIncludeLocation}
                                trackColor={{ false: "#767577", true: "#ffa500" }}
                                thumbColor={includeLocation ? "#f5dd4b" : "#f4f3f4"}
                            />
                            <Text style={styles.switchLabel}>
                                {includeLocation ? "Location will be shared" : "Location will not be shared"}
                            </Text>
                        </View>
                    </View>
                )}
                
                <Pressable 
                    onPress={submitAlert}
                    style={styles.confirmButton}
                >
                    <Text style={styles.confirmText}>Confirm</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    Container: {
        flex: 1,
        fontSize: 30,
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    messageContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        textAlignVertical: 'top',
        height: 120,
        fontSize: 16,
    },
    tagCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'right',
    },
    Text: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    view: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tagButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        minWidth: 100,
        alignItems: 'center',
    },
    selectedTagButton: {
        backgroundColor: 'orange',
        borderColor: 'orange',
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    selectedTagText: {
        color: 'white',
    },
    locationContainer: {
        marginVertical: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    switchLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#555',
    },
    confirmButton: {
        backgroundColor: 'orange',
        borderRadius: 10,
        paddingVertical: 15,
        marginTop: 10,
        marginBottom: 40,
    },
    confirmText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    }
});

export default AlertMenuScreen;