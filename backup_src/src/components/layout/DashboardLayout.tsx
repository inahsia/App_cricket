import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../navigation/AuthProvider';

const DashboardLayout = ({ children, title }) => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  const adminMenuItems = [
    { route: 'AdminDashboard', icon: 'home', text: 'Dashboard' },
    { route: 'Sports', icon: 'futbol-o', text: 'Sports' },
    { route: 'Slots', icon: 'clock-o', text: 'Slots' },
    { route: 'Bookings', icon: 'calendar', text: 'Bookings' },
    { route: 'Users', icon: 'users', text: 'Users' },
    { route: 'Settings', icon: 'cog', text: 'Settings' },
  ];

  const userMenuItems = [
    { route: 'UserDashboard', icon: 'home', text: 'Dashboard' },
    { route: 'BookSport', icon: 'calendar-plus-o', text: 'Book Sport' },
    { route: 'MyBookings', icon: 'list', text: 'My Bookings' },
    { route: 'Profile', icon: 'user', text: 'Profile' },
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Red Ball Academy</Text>
        </View>
        
        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <Icon name={item.icon} size={20} style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="sign-out" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <ScrollView style={styles.mainContent}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  logoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuIcon: {
    marginRight: 10,
    color: '#4B5563',
  },
  menuText: {
    color: '#4B5563',
    fontSize: 16,
  },
  userSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
});

export default DashboardLayout;