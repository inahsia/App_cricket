/**
 * Utility functions for formatting data
 */

export const formatCurrency = (amount: string | number | undefined): string => {
  if (amount === undefined || amount === null) {
    return '₹0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2)}`;
};

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return dateObj.toLocaleDateString('en-US', options);
  } catch (error) {
    return String(date);
  }
};

export const formatTime = (time: string): string => {
  try {
    // Time comes as HH:mm:ss from backend
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return time;
  }
};

export const formatDateTime = (dateTime: string): string => {
  try {
    const dateObj = new Date(dateTime);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    return `${dateObj.toLocaleDateString('en-US', dateOptions)}, ${dateObj.toLocaleTimeString('en-US', timeOptions)}`;
  } catch (error) {
    return String(dateTime);
  }
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Not Checked In': '#FF9800',
    'Checked In': '#4CAF50',
    'Checked Out': '#2196F3',
    'available': '#4CAF50',
    'booked': '#F44336',
    'pending': '#FF9800',
    'verified': '#2196F3',
  };
  return statusColors[status] || '#757575';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  getStatusColor,
  validateEmail,
  validatePhone,
  truncateText,
};
