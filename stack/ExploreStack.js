import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import ResolvedAlertsScreen from '../screens/ResolvedAlertsScreen';

const Stack = createNativeStackNavigator();

function ExploreStack(){
    return(
        <Stack.Navigator  screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Explore' component={ExploreScreen}/>
            <Stack.Screen name='AlertDetail' component={AlertDetailScreen}/>
            <Stack.Screen name='ResolvedAlerts' component={ResolvedAlertsScreen}/>
        </Stack.Navigator>
    )
}

export default ExploreStack;