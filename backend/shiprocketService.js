/**
 * Shiprocket Logistics Integration Service for BRIVOO
 * Credentials: brivo0504@gmail.com
 * Custom Channel: brivoo (CUSTOM) (ID: 8083356)
 * Primary Pickup: BRIVOO Atelier Mumbai (400050)
 */

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

class ShiprocketService {
  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL || 'brivo0504@gmail.com';
    this.password = process.env.SHIPROCKET_PASSWORD || 'SflMA^8rx9NF7vbtnxCNvyTDCIv#WvIg';
    this.channelId = process.env.SHIPROCKET_CHANNEL_ID || '8083356';
    this.defaultPickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'BRIVOO Atelier Mumbai';
    this.defaultPickupPincode = '400050';
    
    this.token = null;
    this.tokenExpiry = null;
  }

  updateCredentials({ email, password, channelId, pickupLocation }) {
    if (email) this.email = email;
    if (password) this.password = password;
    if (channelId) this.channelId = channelId;
    if (pickupLocation) this.defaultPickupLocation = pickupLocation;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.token && this.tokenExpiry && now < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || `Shiprocket authentication failed with status ${response.status}`);
      }

      this.token = data.token;
      // Tokens expire in ~10 days. Cache for 8 days (in milliseconds)
      this.tokenExpiry = now + 8 * 24 * 60 * 60 * 1000;
      return this.token;
    } catch (err) {
      console.error('[Shiprocket] Auth Error:', err.message);
      throw err;
    }
  }

  async request(endpoint, options = {}, retryOn401 = true) {
    const token = await this.getToken();
    const url = endpoint.startsWith('http') ? endpoint : `${SHIPROCKET_BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 && retryOn401) {
      console.warn('[Shiprocket] Token expired, refreshing token...');
      this.token = null;
      return this.request(endpoint, options, false);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: await response.text() };
    }

    return { ok: response.ok, status: response.status, data };
  }

  /**
   * Get Live Connection & Account Status
   */
  async getStatus() {
    try {
      const token = await this.getToken();
      
      // Fetch wallet balance
      const walletRes = await this.request('/account/details/wallet-balance');
      const walletBalance = walletRes.data?.data?.balance_amount || '0';

      // Fetch channels
      const channelsRes = await this.request('/channels');
      const channels = channelsRes.data?.data || [];
      const currentChannel = channels.find(c => String(c.id) === String(this.channelId)) || channels[0] || null;

      // Fetch pickup locations
      const pickupRes = await this.request('/settings/company/pickup');
      const pickupAddresses = pickupRes.data?.data?.shipping_address || [];

      return {
        success: true,
        connected: true,
        email: this.email,
        companyName: pickupRes.data?.data?.company_name || 'sujal enterprises',
        walletBalance: Number(walletBalance),
        channelId: this.channelId,
        channelName: currentChannel?.store_name || currentChannel?.name || 'brivoo (CUSTOM)',
        defaultPickupLocation: this.defaultPickupLocation,
        defaultPickupPincode: this.defaultPickupPincode,
        pickupLocations: pickupAddresses.map(addr => ({
          id: addr.id,
          name: addr.pickup_location,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          pin_code: addr.pin_code,
          phone: addr.phone,
          isPrimary: addr.is_primary_location === 1
        }))
      };
    } catch (err) {
      return {
        success: false,
        connected: false,
        email: this.email,
        error: err.message
      };
    }
  }

  /**
   * Check Courier Serviceability & Rates
   */
  async checkServiceability({ pickup_postcode, delivery_postcode, weight = 0.5, cod = 0 }) {
    const pickup = pickup_postcode || this.defaultPickupPincode;
    const codVal = cod ? 1 : 0;
    const query = new URLSearchParams({
      pickup_postcode: pickup,
      delivery_postcode,
      weight: String(weight),
      cod: String(codVal)
    });

    const res = await this.request(`/courier/serviceability/?${query.toString()}`);
    if (!res.ok) {
      throw new Error(res.data?.message || 'Failed to check serviceability');
    }

    const couriers = res.data?.data?.available_courier_companies || [];
    return {
      success: true,
      pickupPincode: pickup,
      deliveryPincode: delivery_postcode,
      availableCouriersCount: couriers.length,
      couriers: couriers.map(c => ({
        id: c.courier_company_id,
        name: c.courier_name,
        estimatedDeliveryDays: c.estimated_delivery_days || c.etd,
        rate: c.rate,
        freightCharge: c.freight_charge,
        codAvailable: c.cod === 1,
        rating: c.rating,
        deliveryPerformance: c.delivery_performance,
        cutoffTime: c.cutoff_time
      }))
    };
  }

  /**
   * Create an Adhoc Order & Shipment in Shiprocket
   */
  async createAdhocOrder(order) {
    // Parse customer name into first & last name
    const nameParts = (order.customerName || 'Valued Customer').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || '.';

    // Sanitize phone number (Shiprocket requires valid digits)
    let phone = (order.phone || '9876543210').replace(/\D/g, '');
    if (phone.length > 10) phone = phone.slice(-10);
    if (phone.length < 10) phone = phone.padEnd(10, '0');

    // Extract pincode
    const fullAddr = order.address || '';
    const pinMatch = fullAddr.match(/\b\d{6}\b/);
    const pincode = order.shippingPincode || (pinMatch ? pinMatch[0] : '400001');

    // Extract city & state
    const city = order.shippingCity || 'Mumbai';
    const state = order.shippingState || 'Maharashtra';

    // Format items
    const items = (order.items || []).map((it, idx) => ({
      name: it.title || `Brivoo Item ${idx + 1}`,
      sku: it.id || `BRV-SKU-${idx + 1}`,
      units: Number(it.quantity || 1),
      selling_price: Number(it.price || 999),
      discount: 0,
      tax: 0
    }));

    const isCod = order.paymentMethod?.toLowerCase().includes('cash') || 
                  order.paymentMethod?.toLowerCase().includes('cod');

    const payload = {
      order_id: String(order.id),
      order_date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      pickup_location: this.defaultPickupLocation,
      channel_id: String(this.channelId),
      comment: `Brivoo Order ${order.id} | Luxury Apparel`,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: fullAddr.slice(0, 80) || 'Customer Residence',
      billing_address_2: fullAddr.length > 80 ? fullAddr.slice(80, 160) : '',
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: order.email || 'customer@brivoo.com',
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: items.length > 0 ? items : [{
        name: 'Brivoo Luxury Apparel',
        sku: 'BRV-APPAREL-GEN',
        units: 1,
        selling_price: Number(order.totalAmount || 1999)
      }],
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: Number(order.totalAmount || 1999),
      length: 20,
      breadth: 15,
      height: 5,
      weight: 0.5
    };

    const res = await this.request('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(res.data?.message || 'Failed to create order on Shiprocket');
    }

    return res.data;
  }

  /**
   * Assign Courier & AWB
   */
  async assignAwb(shipmentId, courierId = null) {
    const payload = { shipment_id: Number(shipmentId) };
    if (courierId) payload.courier_id = Number(courierId);

    const res = await this.request('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const body = res.data;

    // Handle wallet recharge needed notice (HTTP 350 or awb_assign_status 0)
    if (body.status_code === 350 || (body.message && body.message.toLowerCase().includes('recharge'))) {
      return {
        success: false,
        requiresRecharge: true,
        message: body.message || 'Please recharge your Shiprocket wallet (min ₹100 required for live AWB generation).',
        statusCode: 350,
        raw: body
      };
    }

    if (body.awb_assign_status === 0) {
      return {
        success: false,
        message: body.response?.data?.awb_assign_error || body.message || 'Failed to assign AWB',
        raw: body
      };
    }

    const responseData = body.response?.data;
    return {
      success: true,
      awbCode: responseData?.awb_code,
      courierCompanyId: responseData?.courier_company_id,
      courierName: responseData?.courier_name,
      assignedDateTime: responseData?.assigned_date_time,
      raw: body
    };
  }

  /**
   * Request Courier Pickup
   */
  async requestPickup(shipmentId) {
    const res = await this.request('/courier/generate/pickup', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] })
    });

    return res.data;
  }

  /**
   * Generate Printable Shipping Label URL
   */
  async generateLabel(shipmentId) {
    const res = await this.request('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({ shipment_id: [Number(shipmentId)] })
    });

    return {
      success: res.ok,
      labelUrl: res.data?.label_url || res.data?.response?.label_url,
      data: res.data
    };
  }

  /**
   * Generate Printable Tax Invoice URL
   */
  async generateInvoice(orderId) {
    const res = await this.request('/orders/print/invoice', {
      method: 'POST',
      body: JSON.stringify({ ids: [Number(orderId)] })
    });

    return {
      success: res.ok,
      invoiceUrl: res.data?.invoice_url,
      data: res.data
    };
  }

  /**
   * Real-time Live Tracking by AWB Code
   */
  async trackAwb(awbCode) {
    const res = await this.request(`/courier/track/awb/${encodeURIComponent(awbCode)}`);
    if (!res.ok) {
      return {
        success: false,
        message: res.data?.message || 'Could not fetch tracking data from Shiprocket',
        data: null
      };
    }

    const trackingData = res.data?.tracking_data;
    return {
      success: true,
      data: trackingData
    };
  }

  /**
   * Cancel Order on Shiprocket
   */
  async cancelOrder(shiprocketOrderId) {
    const res = await this.request('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: [Number(shiprocketOrderId)] })
    });

    return res.data;
  }

  /**
   * Get Pickup Locations List
   */
  async getPickupLocations() {
    const res = await this.request('/settings/company/pickup');
    return res.data;
  }

  /**
   * Add a New Pickup Warehouse Location
   */
  async addPickupLocation(payload) {
    const res = await this.request('/settings/company/addpickup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }
}

export const shiprocket = new ShiprocketService();
