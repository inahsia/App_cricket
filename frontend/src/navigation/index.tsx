import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Colors from '../config/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordConfirmScreen from '../screens/ResetPasswordConfirmScreen';

// User Screens
import UserHomeScreen from '../screens/user/UserHomeScreen';
import SportsListScreen from '../screens/user/SportsListScreen';
import SlotsListScreen from '../screens/user/SlotsListScreen';
import BookingScreen from '../screens/user/BookingScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import ChangePasswordScreen from '../screens/user/ChangePasswordScreen';

// Player Screens
import PlayerDashboardScreen from '../screens/player/PlayerDashboardScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageSportsScreen from '../screens/admin/ManageSportsScreen';
import ManageSlotsScreenEnhanced from '../screens/admin/ManageSlotsScreen_Enhanced';
import QRScannerScreen from '../screens/admin/QRScannerScreen';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// User Tab Navigator
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {backgroundColor: '#D32F2F'},
        headerTintColor: '#FFFFFF',
      }}>
      <Tab.Screen name="Home" component={UserHomeScreen} />
      <Tab.Screen name="Sports" component={SportsListScreen} />
      <Tab.Screen name="My Bookings" component={MyBookingsScreen} />
    </Tab.Navigator>
  );
};

// Player Tab Navigator
const PlayerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {backgroundColor: '#D32F2F'},
        headerTintColor: '#FFFFFF',
      }}>
      <Tab.Screen name="Dashboard" component={PlayerDashboardScreen} />
    </Tab.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {backgroundColor: '#D32F2F'},
        headerTintColor: '#FFFFFF',
      }}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Sports" component={ManageSportsScreen} />
      <Tab.Screen name="Slots" component={ManageSlotsScreenEnhanced} />
      <Tab.Screen name="Bookings" component={AllBookingsScreen} />
      <Tab.Screen name="Scanner" component={QRScannerScreen} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: '#D32F2F',
          },
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{title: 'Create Account'}}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{title: 'Forgot Password'}}
        />
        <Stack.Screen
          name="ResetPasswordConfirm"
          component={ResetPasswordConfirmScreen}
          options={{title: 'Reset Password'}}
        />
        <Stack.Screen
          name="UserTab"
          component={UserTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PlayerTab"
          component={PlayerTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AdminTab"
          component={AdminTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Slots" component={SlotsListScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen}
          options={{title: 'Change Password'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
