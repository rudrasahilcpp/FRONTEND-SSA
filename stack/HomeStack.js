import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AlertMenuScreen from '../screens/AlertMenuScreen';

const Stack = createNativeStackNavigator();

function HomeStack(){
    return(
        <Stack.Navigator  screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Home' component={HomeScreen}/>
            <Stack.Screen name='AlertMenu' component={AlertMenuScreen}/>
        </Stack.Navigator>
    )
}

export default HomeStack;