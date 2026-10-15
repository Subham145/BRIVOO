import assert from 'assert';
import { generateOrderConfirmationHtml, sendOrderConfirmationEmail } from './emailService.js';
import { readData, writeData } from './db.js';

async function runTests() {
  console.log('=== BRIVOO Order Confirmation Email System Tests ===\n');

  const db = readData();
  const testProduct = (db.products || [])[0] || {
    id: 'prod-test',
    title: 'European Flax Linen Camp Collar Shirt',
    price: 1999,
    image: 'https://brivoo.in/images/hero.png',
    stock: 20,
    inStock: true
  };

  // ----------------------------------------------------
  // TEST 1: COD Order Confirmation Email Generation
  // ----------------------------------------------------
  console.log('Test 1: Testing Cash on Delivery order confirmation HTML generation...');
  const codOrder = {
    id: `BRV-COD-${Date.now().toString().slice(-5)}`,
    customerName: 'Aarav Singhania',
    email: 'aarav.singhania@example.com',
    phone: '+91 98200 11223',
    address: 'B-14, Regency Heights, Worli Sea Face, Mumbai 400018',
    shippingCity: 'Mumbai',
    shippingState: 'Maharashtra',
    shippingPincode: '400018',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    subtotal: 3998,
    discountAmount: 400,
    couponCode: 'FESTIVE10',
    deliveryCharge: 0,
    totalAmount: 3598,
    items: [
      {
        id: testProduct.id,
        title: testProduct.title,
        price: testProduct.price,
        quantity: 2,
        selectedSize: 'L',
        selectedColor: 'Pristine White',
        image: testProduct.image
      }
    ],
    tracking: {
      carrier: 'BlueDart Express',
      trackingNumber: 'BLUEDART-9920192',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  const codHtml = generateOrderConfirmationHtml(codOrder);

  assert.ok(codHtml.includes('Aarav Singhania'), 'Must include customer name');
  assert.ok(codHtml.includes(codOrder.id), 'Must include order ID');
  assert.ok(codHtml.includes('Cash on Delivery'), 'Must display Cash on Delivery payment method');
  assert.ok(codHtml.includes('Payment Pending'), 'Must display Payment Pending status for COD');
  assert.ok(codHtml.includes('Amount to Pay Upon Delivery'), 'Must clearly show amount to pay upon delivery for COD');
  assert.ok(codHtml.includes('3,598'), 'Must include final payable amount');
  assert.ok(codHtml.includes('3,998'), 'Must include subtotal');
  assert.ok(codHtml.includes('400'), 'Must include discount');
  assert.ok(codHtml.includes('COMPLIMENTARY (FREE)'), 'Must show delivery charges');
  assert.ok(codHtml.includes('Worli Sea Face'), 'Must include shipping address');
  assert.ok(codHtml.includes('BlueDart Express'), 'Must include carrier and delivery info');
  assert.ok(codHtml.includes('B R I V O O'), 'Must include BRIVOO luxury branding');
  console.log('✓ COD order HTML passed all verification checks.');

  // ----------------------------------------------------
  // TEST 2: Prepaid Order Confirmation Email Generation
  // ----------------------------------------------------
  console.log('\nTest 2: Testing Prepaid order confirmation HTML generation...');
  const prepaidOrder = {
    id: `BRV-PRE-${Date.now().toString().slice(-5)}`,
    customerName: 'Devika Mehra',
    email: 'devika.mehra@example.com',
    phone: '+91 99100 44556',
    address: '42, Amrita Shergill Marg, New Delhi 110003',
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    paymentRef: 'pay_RZP_99812401',
    subtotal: 1999,
    discountAmount: 0,
    deliveryCharge: 0,
    totalAmount: 1999,
    items: [
      {
        id: testProduct.id,
        title: testProduct.title,
        price: testProduct.price,
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'Olive Sage',
        image: testProduct.image
      }
    ],
    tracking: {
      carrier: 'BlueDart Express',
      trackingNumber: 'BLUEDART-7728190',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  const prepaidHtml = generateOrderConfirmationHtml(prepaidOrder);

  assert.ok(prepaidHtml.includes('Devika Mehra'), 'Must include customer name');
  assert.ok(prepaidHtml.includes(prepaidOrder.id), 'Must include order ID');
  assert.ok(prepaidHtml.includes('Paid'), 'Must display Paid status');
  assert.ok(prepaidHtml.includes('pay_RZP_99812401'), 'Must include payment transaction ref');
  assert.ok(prepaidHtml.includes('Payment Verified: ₹1,999 Paid in Full'), 'Must display verified paid banner');
  assert.ok(!prepaidHtml.includes('Amount to Pay Upon Delivery'), 'Must NOT ask for payment on delivery for prepaid order');
  console.log('✓ Prepaid order HTML passed all verification checks.');

  // ----------------------------------------------------
  // TEST 3: Idempotency & Duplicate Prevention
  // ----------------------------------------------------
  console.log('\nTest 3: Testing duplicate prevention upon page refresh or webhook retry...');
  let testDb = { orders: [codOrder] };
  const mockWrite = (d) => { testDb = d; };

  // First dispatch: simulate email sent successfully
  codOrder.emailNotification = {
    status: 'sent',
    provider: 'resend',
    messageId: 'msg_resend_first_dispatch_991',
    sentAt: new Date().toISOString()
  };

  // Attempt duplicate dispatch (e.g. user refreshed screen or webhook retried)
  const duplicateAttempt = await sendOrderConfirmationEmail(codOrder, testDb, mockWrite);
  assert.strictEqual(duplicateAttempt.alreadySent, true, 'Must return alreadySent: true');
  assert.strictEqual(duplicateAttempt.messageId, 'msg_resend_first_dispatch_991', 'Must preserve original message ID');
  console.log('✓ Duplicate email successfully prevented on repeated requests.');

  // ----------------------------------------------------
  // TEST 4: Non-blocking Resilience on Provider Failure
  // ----------------------------------------------------
  console.log('\nTest 4: Testing non-blocking resilience (email error does not cancel order)...');
  const freshOrder = {
    id: `BRV-RESILIENT-${Date.now().toString().slice(-4)}`,
    customerName: 'Kabir Oberoi',
    email: 'invalid-or-unreachable-email@domain.com',
    totalAmount: 1999,
    items: []
  };

  // Even if dispatch encounters missing env or network error, order remains intact
  const dispatchRes = await sendOrderConfirmationEmail(freshOrder, testDb, mockWrite);
  assert.ok(freshOrder.id, 'Order object must remain intact and preserved');
  assert.ok(freshOrder.emailNotification, 'Email notification audit must be recorded');
  console.log('✓ Order remains fully valid and preserved even when email provider is offline/unconfigured.');

  console.log('\n======================================================');
  console.log('>>> ALL ORDER CONFIRMATION EMAIL TESTS PASSED! <<<');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
