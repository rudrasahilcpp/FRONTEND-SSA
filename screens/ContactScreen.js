import { useState, useEffect, useRef } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    Pressable, 
    Modal, 
    TextInput, 
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { CONTACT_ENDPOINTS, ALERT_ENDPOINTS } from '../config/apiConfig';

function ContactScreen({ navigation }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sendingSOSTo, setSendingSOSTo] = useState(null);

    // Modal states
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    
    // New contact form state
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    // Reference for long press timer
    const sosTimeoutRef = useRef(null);

    // Fetch contacts from the API
    const fetchContacts = async () => {
        try {
            setRefreshing(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(CONTACT_ENDPOINTS.GET_ALL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            Alert.alert("Error", "Failed to load contacts");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Delete a contact
    const deleteContact = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(CONTACT_ENDPOINTS.DELETE(id), {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update the contacts list after deletion
            setContacts(contacts.filter(contact => contact._id !== id));
            
            Alert.alert("Success", "Contact deleted successfully");
        } catch (error) {
            console.error("Error deleting contact:", error);
            Alert.alert("Error", "Failed to delete contact");
        }
    };

    // Add a new contact
    const addContact = async () => {
        if (!newName.trim() || !newPhone.trim()) {
            Alert.alert("Error", "Name and phone number are required");
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(
                CONTACT_ENDPOINTS.CREATE,
                {
                    name: newName,
                    phone: newPhone
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Reset form and close modal
            setNewName('');
            setNewPhone('');
            setAddModalVisible(false);
            
            // Refresh contacts
            fetchContacts();
            
        } catch (error) {
            console.error("Error adding contact:", error);
            Alert.alert("Error", "Failed to add contact");
        }
    };

    // View contact details
    const viewContactDetails = (contact) => {
        setSelectedContact(contact);
        setDetailModalVisible(true);
    };

    // Call the contact
    const callContact = (phone) => {
        Linking.openURL(`tel:${phone}`).catch(err => {
            Alert.alert("Error", "Could not open phone app");
        });
    };

    // Handle SOS button press in
    const handleSOSPressIn = (contact) => {
        setSendingSOSTo(contact._id);
        
        // Set a timeout to send SOS after 2 seconds of holding
        sosTimeoutRef.current = setTimeout(() => {
            sendEmergencySOS(contact);
        }, 2000);
    };

    // Handle SOS button press out
    const handleSOSPressOut = () => {
        setSendingSOSTo(null);
        
        // Clear the timeout if released before 2 seconds
        if (sosTimeoutRef.current) {
            clearTimeout(sosTimeoutRef.current);
            sosTimeoutRef.current = null;
        }
    };

    // Handle normal SOS button tap
    const handleSOSTap = (contact) => {
        // Only navigate to AlertMenu on a quick tap (not after a long press)
        if (!sosTimeoutRef.current || sosTimeoutRef.current === null) {
            // Pass the specific contact to the AlertMenu using nested navigation
            navigation.navigate("HomeStack", { 
                screen: "AlertMenu", 
                params: { targetContact: contact } 
            });
        }
    };

    // Send emergency SOS alert to a specific contact
    const sendEmergencySOS = async (contact) => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            // Send emergency alert with HIGH priority targeting only this contact
            await axios.post(
                ALERT_ENDPOINTS.CREATE,
                {
                    message: `Emergency SOS to ${contact.name}`,
                    tags: ['HIGH'],
                    specificContact: contact._id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            Alert.alert(
                "Emergency Alert Sent", 
                `Your emergency alert has been sent to ${contact.name}`,
                [{ text: "OK" }]
            );
            
        } catch (error) {
            console.error("Error sending emergency alert:", error);
            Alert.alert("Error", "Failed to send emergency alert. Please try again.");
        } finally {
            setSendingSOSTo(null);
        }
    };

    // Load contacts on initial render
    useEffect(() => {
        fetchContacts();
    }, []);

    // Render each contact item
    const renderContactItem = ({ item }) => (
        <View style={styles.contactItem}>
            <Pressable 
                style={styles.contactInfo}
                onPress={() => viewContactDetails(item)}
            >
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
            </Pressable>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[
                        styles.sosButton,
                        sendingSOSTo === item._id && styles.sosButtonActive
                    ]}
                    onPress={() => handleSOSTap(item)}
                    onPressIn={() => handleSOSPressIn(item)}
                    onPressOut={handleSOSPressOut}
                >
                    <Text style={styles.sosButtonText}>SOS</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            "Delete Contact",
                            `Are you sure you want to delete ${item.name}?`,
                            [
                                { text: "Cancel" },
                                { text: "Delete", onPress: () => deleteContact(item._id) }
                            ]
                        );
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Emergency Contacts</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setAddModalVisible(true)}
                >
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="orange" style={styles.loader} />
            ) : (
                <FlatList
                    data={contacts}
                    renderItem={renderContactItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={fetchContacts}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No contacts added yet. Tap the + button to add a contact.
                        </Text>
                    }
                />
            )}

            {/* Add Contact Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Contact</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={newName}
                            onChangeText={setNewName}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={newPhone}
                            onChangeText={setNewPhone}
                            keyboardType="phone-pad"
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setNewName('');
                                    setNewPhone('');
                                    setAddModalVisible(false);
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={addContact}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Contact Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                {selectedContact && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Contact Details</Text>
                            
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Name:</Text>
                                <Text style={styles.detailValue}>{selectedContact.name}</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Phone:</Text>
                                <Text style={styles.detailValue}>{selectedContact.phone}</Text>
                            </View>
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setDetailModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.callButton]}
                                    onPress={() => callContact(selectedContact.phone)}
                                >
                                    <Text style={styles.buttonText}>Call</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: 'orange',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 1,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 18,
        fontWeight: '600',
    },
    contactPhone: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        padding: 8,
    },
    sosButton: {
        backgroundColor: 'red',
        borderRadius: 5,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
    },
    sosButtonActive: {
        backgroundColor: '#cc0000',
        transform: [{ scale: 0.95 }],
    },
    sosButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 100,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ff4040',
    },
    saveButton: {
        backgroundColor: '#4caf50',
    },
    callButton: {
        backgroundColor: '#2196f3',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    detailItem: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 18,
    },
});

export default ContactScreen;