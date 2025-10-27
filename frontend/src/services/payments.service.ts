/**
 * Payments API Service (Razorpay Integration)
 */

import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';
import { PaymentOrder } from '../types';

interface CreateOrderData {
  booking_id: number;
  amount: number;
}

interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: number;
}

export const PaymentsService = {
  /**
   * Create Razorpay order
   */
  async createOrder(data: CreateOrderData): Promise<PaymentOrder> {
    return await ApiService.post<PaymentOrder>(
      API_ENDPOINTS.CREATE_PAYMENT_ORDER,
      data
    );
  },

  /**
   * Verify payment signature
   */
  async verifyPayment(data: VerifyPaymentData): Promise<{
    message: string;
    booking: any;
  }> {
    return await ApiService.post(
      API_ENDPOINTS.VERIFY_PAYMENT,
      data
    );
  },
};

export default PaymentsService;
