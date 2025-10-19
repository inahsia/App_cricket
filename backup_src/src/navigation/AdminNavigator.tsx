import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminBookingHistory from '../screens/admin/AdminBookingHistory';
import SportsManagement from '../screens/admin/SportsManagement';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="BookingHistory" component={AdminBookingHistory} />
      <Stack.Screen name="SportsManagement" component={SportsManagement} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;