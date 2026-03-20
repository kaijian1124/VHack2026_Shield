import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet, Animated } from 'react-native';

import AnalysisScreen from '../screens/AnalysisScreen';
import DetailScreen from '../screens/DetailScreen';
import HelpScreen from '../screens/HelpScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const C = {
  bg: '#EEF2EF',
  surface: '#FFFFFF',
  dark: '#484F58',
  green: '#006D4B',
  text: '#1A1F2C',
  muted: '#9AA3AF',
};

// ─── Custom Transition: Zoom + Fade (Match-and-Move feel) ─────────────────────
function forMatchAndMove({ current, next, layouts }) {
  const progress = Animated.add(
    current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }) : 0,
  );

  return {
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.8, 1],
      }),
      transform: [
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.94, 1],
          }),
        },
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
    },
  };
}

// ─── History Stack (History → Detail) ────────────────────────────────────────
function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.bg, shadowOpacity: 0, elevation: 0, borderBottomWidth: 0 },
        headerTintColor: C.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 17, letterSpacing: -0.3 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: C.bg },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: forMatchAndMove,
        transitionSpec: {
          open: {
            animation: 'spring',
            config: { stiffness: 400, damping: 80, mass: 1, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 },
          },
          close: {
            animation: 'spring',
            config: { stiffness: 400, damping: 80, mass: 1 },
          },
        },
      }}
    >
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: 'Call Analysis',
          headerStyle: { backgroundColor: C.bg, elevation: 0, shadowOpacity: 0 },
        }}
      />
    </Stack.Navigator>
  );
}

// ─── Tab Icon ─────────────────────────────────────────────────────────────────
function TabIcon({ icon, label, focused }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={[tabStyles.icon, { fontSize: focused ? 18 : 16 }]}>{icon}</Text>
      {!focused && <Text style={tabStyles.iconLabel}>{label}</Text>}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, minWidth: 52 },
  iconWrapActive: { backgroundColor: C.dark, paddingHorizontal: 18, flexDirection: 'row', gap: 6 },
  icon: { lineHeight: 22 },
  iconLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2 },
});

// ─── Main Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: C.surface,
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: C.text,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 20,
            height: 72,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 12,
          },
          tabBarShowLabel: false,
          tabBarItemStyle: { borderRadius: 20 },
        })}
      >
        <Tab.Screen
          name="Analyze"
          component={AnalysisScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Analyze" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="History" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Help"
          component={HelpScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🆘" label="Help" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}