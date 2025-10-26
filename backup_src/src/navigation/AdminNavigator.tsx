import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminBookingHistory from '../screens/admin/AdminBookingHistory';
import SportsManagement from '../screens/admin/SportsManagement';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';
import ManageSlotsScreenEnhanced from '../screens/admin/ManageSlotsScreen_Enhanced';

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
      <Stack.Screen 
        name="AllBookings" 
        component={AllBookingsScreen}
        options={{ title: 'Manage Bookings' }}
      />
      <Stack.Screen 
        name="ManageSlots" 
        component={ManageSlotsScreenEnhanced}
        options={{ title: 'Manage Slots' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;