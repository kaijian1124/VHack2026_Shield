import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import AnalysisScreen from '../screens/AnalysisScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DetailScreen from '../screens/DetailScreen';
import HelpScreen from '../screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'Analysis History' }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Call Detail' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="AnalyzeTab"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const icons = { AnalyzeTab: '🛡️', HistoryTab: '📋', HelpTab: '🆘' };
            return <Text style={{ fontSize: focused ? 24 : 20 }}>{icons[route.name]}</Text>;
          },
          tabBarActiveTintColor: '#3F51B5',
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#1A237E' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        })}
      >
        <Tab.Screen
          name="AnalyzeTab"
          component={AnalysisScreen}
          options={{ title: 'Protect' }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="HelpTab"
          component={HelpScreen}
          options={{ title: 'Help' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
