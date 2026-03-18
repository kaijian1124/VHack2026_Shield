import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import CallLogScreen from '../screens/CallLogScreen';
import DetailScreen from '../screens/DetailScreen';
import HelpScreen from '../screens/HelpScreen';
import AnalyzeScreen from '../screens/AnalyzeScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CallLogStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CallLog" component={CallLogScreen} options={{ title: 'Call Log' }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Call Detail' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const icons = { Home: '🛡️', Log: '📋', Analyze: '🔍', History: '📊', Help: '🆘' };
            return <Text style={{ fontSize: focused ? 24 : 20 }}>{icons[route.name]}</Text>;
          },
          tabBarActiveTintColor: '#3F51B5',
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#1A237E' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ScamShield 🛡️' }} />
        <Tab.Screen name="Log" component={CallLogStack} options={{ headerShown: false }} />
        <Tab.Screen name="Analyze" component={AnalyzeScreen} options={{ title: 'Analyze Call' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Tab.Screen name="Help" component={HelpScreen} options={{ title: 'Help & Resources' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}