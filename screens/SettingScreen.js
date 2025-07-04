import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

function SettingScreen() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const { signOut } = useContext(AuthContext);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            const response = await axios.get(AUTH_ENDPOINTS.PROFILE, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setUserInfo(response.data);
                console.log("User profile loaded:", response.data);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setError("Failed to load user profile. Please try again.");
            
            // If the token is invalid/expired, redirect to login
            if (error.response && error.response.status === 401) {
                await AsyncStorage.removeItem('token');
                Alert.alert("Session Expired", "Please login again", [
                    { text: "OK", onPress: () => signOut() }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel" },
                { 
                    text: "Logout", 
                    onPress: async () => {
                        try {
                            // Use the signOut function from AuthContext
                            // This will handle token removal and navigation
                            signOut();
                        } catch (error) {
                            console.error("Error during logout:", error);
                            Alert.alert("Error", "Failed to logout. Please try again.");
                        }
                    } 
                }
            ]
        );
    };

    const retryFetchProfile = () => {
        fetchUserProfile();
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="orange" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryFetchProfile}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.profileIcon}>
                    <Ionicons name="person" size={60} color="white" />
                </View>
                <Text style={styles.profileName}>{userInfo?.name || 'User'}</Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                    <Ionicons name="mail-outline" size={24} color="#666" style={styles.infoIcon} />
                    <View>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{userInfo?.email || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={24} color="#666" style={styles.infoIcon} />
                    <View>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{userInfo?.phone || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: 'orange',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileSection: {
        alignItems: 'center',
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    infoSection: {
        padding: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoIcon: {
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#ff4040',
        borderRadius: 10,
        padding: 15,
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default SettingScreen;