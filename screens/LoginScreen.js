import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  function emailChange(event){
    setEmail(event);
  }

  function passwordChange(event){
    setPassword(event);
  }

  const handleLogin = async() => {
    // Validate both fields are filled
    if (!email.trim() || !password.trim()) {
      Alert.alert("Login Error", "Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      // Clear previous token before login
      await AsyncStorage.removeItem('token');
      
      const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password
      });

      if (response.data && response.data.token) {
        console.log("Login successful");
        signIn(response.data.token);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.log("Login unsuccessful", error);
      Alert.alert(
        "Login Failed", 
        error.response?.data?.message || "Invalid email or password"
      );
      // Ensure token is cleared on failed login
      await AsyncStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };
  
  return(
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder='Email' 
        onChangeText={emailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder='Password' 
        onChangeText={passwordChange}
        secureTextEntry={true}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" color="orange" style={styles.loader} />
      ) : (
        <Pressable onPress={handleLogin}>
          <View style={styles.button}>
            <Text style={styles.text}>Login</Text>
          </View>
        </Pressable>
      )}
      
      {/* Register button */}
      <Pressable 
        onPress={() => navigation.navigate('register')} 
        style={styles.registerButton}
      >
        <Text style={styles.registerText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 17,
    paddingTop: 100,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  button: {
    width: 380,
    height: 50,
    backgroundColor: 'orange',
    marginTop: 30,
    borderRadius: 10,
    justifyContent: 'center',
  },
  text: {
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  registerButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  registerText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 30,
  }
});
