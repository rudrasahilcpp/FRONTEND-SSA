import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import TabStack from './stack/TabStack.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from './contexts/AuthContext.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add a ref to the navigation container
  const navigationRef = useRef(null);

  const checkLoginState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error("Error checking authentication token:", error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  // Create navigation actions that can be called outside of components
  const navigateToLogin = useCallback(() => {
    if (navigationRef.current) {
      navigationRef.current.resetRoot({
        index: 0,
        routes: [{ name: 'login' }],
      });
    }
  }, []);

  const navigateToTabs = useCallback(() => {
    if (navigationRef.current) {
      navigationRef.current.resetRoot({
        index: 0,
        routes: [{ name: 'tabs' }],
      });
    }
  }, []);

  // Auth context value
  const authContext = useMemo(() => ({
    signIn: async (token) => {
      await AsyncStorage.setItem('token', token);
      setIsLoggedIn(true);
      navigateToTabs();
    },
    signOut: async () => {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
      navigateToLogin();
    },
    isLoggedIn
  }), [isLoggedIn, navigateToLogin, navigateToTabs]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="tabs" component={TabStack} />
          ) : (
            <>
              <Stack.Screen name="login" component={LoginScreen} />
              <Stack.Screen name="register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

