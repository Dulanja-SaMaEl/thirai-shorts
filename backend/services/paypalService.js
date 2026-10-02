import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * PayPal REST API v2 Service
 * Handles OAuth2 authentication, order creation, and capture processing for Sandbox and Production.
 */
class PayPalService {
  constructor() {
    this.cachedToken = null;
    this.tokenExpiry = null;
  }

  get mode() {
    return process.env.PAYPAL_MODE || 'sandbox';
  }

  get baseUrl() {
    return this.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  get clientId() {
    return process.env.PAYPAL_CLIENT_ID;
  }

  get clientSecret() {
    return process.env.PAYPAL_CLIENT_SECRET;
  }

  /**
   * Fetch OAuth2 access token with in-memory caching
   */
  async getAccessToken() {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry && now < this.tokenExpiry - 60000) {
      return this.cachedToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) are not configured.');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PayPal OAuth Error:', errorText);
      throw new Error(`Failed to authenticate with PayPal: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.cachedToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in * 1000);
    return this.cachedToken;
  }

  /**
   * Create PayPal Checkout Order
   * @param {Object} params
   * @param {number|string} params.amount
   * @param {string} [params.currency='USD']
   * @param {string} [params.description]
   * @param {string} [params.customId]
   */
  async createOrder({ amount, currency = 'USD', description = 'Thirai+ Festival Checkout', customId = '' }) {
    const token = await this.getAccessToken();

    const formattedAmount = parseFloat(amount).toFixed(2);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: customId || `thirai_${Date.now()}`,
          description: description.substring(0, 127),
          custom_id: customId || undefined,
          amount: {
            currency_code: currency.toUpperCase(),
            value: String(formattedAmount),
          },
        },
      ],
      application_context: {
        brand_name: 'Thirai+ Short Film Festival',
        landing_page: 'NO_PREFERENCE',   // Standard flow: popup shows login + card link beneath
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal Create Order Error:', data);
      throw new Error(data.message || 'Failed to create PayPal order');
    }

    return data;
  }

  /**
   * Capture authorized PayPal Checkout Order
   * @param {string} orderId
   */
  async captureOrder(orderId) {
    if (!orderId) {
      throw new Error('PayPal Order ID is required for capture.');
    }

    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal Capture Order Error:', data);
      throw new Error(data.message || `Failed to capture PayPal order: ${orderId}`);
    }

    return data;
  }

  /**
   * Retrieve PayPal Order Details
   * @param {string} orderId
   */
  async getOrder(orderId) {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve PayPal order details');
    }

    return data;
  }
}

export const paypalService = new PayPalService();
export default paypalService;
