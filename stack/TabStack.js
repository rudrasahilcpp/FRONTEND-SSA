import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ContactScreen from '../screens/ContactScreen.js'
import SettingScreen from '../screens/SettingScreen.js'
import HomeStack from './HomeStack.js'
import ExploreStack from './ExploreStack.js';

const Tab = createBottomTabNavigator();
function TabStack() {
  return (
      <Tab.Navigator>
        <Tab.Screen name='HomeStack' component={HomeStack}/>
        <Tab.Screen name='Contact' component={ContactScreen}/>
        <Tab.Screen name='ExploreStack' component={ExploreStack}/>
        <Tab.Screen name='Setting' component={SettingScreen}/>
      </Tab.Navigator>
    
  );
}

export default TabStack;
