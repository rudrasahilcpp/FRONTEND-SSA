import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

function AlertCard(props) {
    const { Name, Tag, navigation, alert } = props;
    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        const checkIfCreator = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(AUTH_ENDPOINTS.PROFILE, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setIsCreator(response.data._id === alert.userID);
            } catch (error) {
                console.error("Error checking creator status:", error);
            }
        };

        checkIfCreator();
    }, [alert]);

    // Truncate message if it's too long
    const truncateMessage = (message, maxLength = 50) => {
        if (!message) return "";
        return message.length > maxLength 
            ? message.substring(0, maxLength) + '...' 
            : message;
    };

    return (
        <Pressable onPress={() => navigation.navigate('AlertDetail', { alert })}>
            <View style={[
                styles.Container, 
                alert.status === 'resolved' && styles.resolvedContainer
            ]}>
                <View style={styles.headerView}>
                    <Text style={styles.nameFont}>
                        {isCreator ? 'You' : Name}
                    </Text>
                    <View style={[
                        styles.statusBadge, 
                        alert.status === 'active' ? styles.activeBadge : styles.resolvedBadge
                    ]}>
                        <Text style={styles.statusText}>
                            {alert.status ? alert.status.toUpperCase() : 'ACTIVE'}
                        </Text>
                    </View>
                </View>
                <View style={styles.messageView}>
                    <Text style={styles.messageText}>
                        {truncateMessage(alert.message)}
                    </Text>
                </View>
                <View style={styles.tagView}>
                    <Text style={styles.tagText}>{Tag}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    Container: {
        height: 150,
        width: 350,
        borderColor: 'orange',
        borderWidth: 1,
        borderRadius: 20,
        marginTop: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    resolvedContainer: {
        borderColor: '#4caf50',
        opacity: 0.8,
    },
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 17,
        paddingTop: 15,
    },
    messageView: {
        flex: 1,
        paddingHorizontal: 17,
        paddingTop: 10,
    },
    tagView: {
        paddingHorizontal: 17,
        paddingBottom: 15,
    },
    nameFont: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageText: {
        fontSize: 14,
        color: '#555',
    },
    tagText: {
        fontSize: 12,
        color: '#666',
    },
    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
        minWidth: 60,
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: '#4caf50', // Green for active
    },
    resolvedBadge: {
        backgroundColor: '#ff4040', // Red for resolved
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    }
});

export default AlertCard;