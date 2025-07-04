import { StyleSheet, Text, View, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

export default function RegisterScreen({navigation}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleRegister = async () => {
    // Validate all fields
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Registration Error", "All fields are required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
        name,
        email,
        phone,
        password
      });

      if (response.data && response.data.token) {
        // Use signIn from AuthContext to automatically log in after registration
        signIn(response.data.token);
      } else {
        // If the backend doesn't automatically provide a token, show success message and redirect to login
        Alert.alert(
          "Registration Successful", 
          "Your account has been created successfully. Please login.",
          [{ text: "OK", onPress: () => navigation.navigate('login') }]
        );
      }
    } catch (error) {
      console.log("Registration failed", error);
      Alert.alert(
        "Registration Failed", 
        error.response?.data?.message || "Unable to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder='Full Name' 
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder='Email' 
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder='Phone Number' 
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder='Password' 
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" color="orange" style={styles.loader} />
      ) : (
        <Pressable onPress={handleRegister}>
          <View style={styles.button}>
            <Text style={styles.text}>Register</Text>
          </View>
        </Pressable>
      )}
      
      <Pressable 
        onPress={() => navigation.navigate('login')} 
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>Already have an account? Login</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
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
  loginButton: {
    marginTop: 40,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 30,
  }
}); 