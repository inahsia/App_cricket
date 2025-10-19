import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Colors from '../config/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = styles.button;
    const variantStyles: Record<string, ViewStyle> = {
      primary: styles.primaryButton,
      secondary: styles.secondaryButton,
      outline: styles.outlineButton,
      danger: styles.dangerButton,
    };
    const sizeStyles: Record<string, ViewStyle> = {
      small: styles.smallButton,
      medium: styles.mediumButton,
      large: styles.largeButton,
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(disabled || loading ? styles.disabledButton : {}),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = styles.buttonText;
    const variantStyles: Record<string, TextStyle> = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      danger: styles.primaryText,
    };
    const sizeStyles: Record<string, TextStyle> = {
      small: styles.smallText,
      medium: styles.mediumText,
      large: styles.largeText,
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text.light} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.text.light,
  },
  secondaryText: {
    color: Colors.text.light,
  },
  outlineText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;
