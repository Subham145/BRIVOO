/**
 * BRIVOO Luxury Atelier - Transactional Email Service
 * Powered by Resend API with reliable server-side execution,
 * trusted database record verification, and duplicate prevention.
 */

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

/**
 * Builds a clean, mobile-responsive HTML order confirmation email
 * matching the BRIVOO luxury brand aesthetic (Charcoal #141414, Atelier Gold #C5A059, Cream #FAF7F2).
 */
export function generateOrderConfirmationHtml(order) {
  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cash on delivery') || (order.paymentMethod || '').toLowerCase() === 'cod';
  const paymentStatusText = isCOD ? 'Payment Pending' : 'Paid';
  const paymentStatusColor = isCOD ? '#D97706' : '#059669';
  const paymentBadgeBg = isCOD ? '#FEF3C7' : '#D1FAE5';

  const subtotal = order.subtotal ?? (order.items || []).reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const discountAmount = Number(order.discountAmount) || 0;
  const prepaidDiscount = Number(order.prepaidDiscount) || 0;
  const deliveryCharge = order.deliveryCharge !== undefined ? Number(order.deliveryCharge) : ((subtotal - discountAmount) >= 1999 || (order.items || []).length === 0 ? 0 : 150);
  const finalPayable = Number(order.totalAmount) || Math.max(0, subtotal - discountAmount - prepaidDiscount + deliveryCharge);

  const appBaseUrl = process.env.APP_URL || 'https://brivoo.in';
  const resolveImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${appBaseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const estimatedDelivery = order.tracking?.estimatedDelivery
    ? new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const itemsHtml = (order.items || []).map((item) => {
    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    const sizeColorInfo = [item.selectedSize ? `Size: ${item.selectedSize}` : '', item.selectedColor ? `Color: ${item.selectedColor}` : ''].filter(Boolean).join(' | ');
    const imageUrl = resolveImageUrl(item.image);

    return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #E6DFC5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${imageUrl ? `
                <td width="64" valign="top" style="padding-right: 14px;">
                  <img src="${imageUrl}" alt="${item.title || 'Product'}" width="60" height="75" style="display: block; border-radius: 8px; object-fit: cover; background-color: #F3EEE7; border: 1px solid #E6DFC5;" />
                </td>
              ` : ''}
              <td valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #141414; line-height: 1.3;">
                  ${item.title || 'BRIVOO Atelier Item'}
                </p>
                ${sizeColorInfo ? `<p style="margin: 0 0 4px; font-size: 12px; color: #78716C;">${sizeColorInfo}</p>` : ''}
                <p style="margin: 0; font-size: 12px; color: #A8A29E;">Qty: <strong>${item.quantity || 1}</strong> &times; ${formatCurrency(item.price)}</p>
              </td>
              <td align="right" valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; white-space: nowrap; padding-left: 12px;">
                <span style="font-size: 14px; font-weight: 700; color: #141414;">
                  ${formatCurrency(itemTotal)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - BRIVOO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #141414;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F5F1EA; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (max-width: 600px) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FAF7F2; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.06); border: 1px solid #E6DFC5;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #141414; padding: 32px 24px; text-align: center; border-bottom: 3px solid #C5A059;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 6px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; text-transform: uppercase;">
                B R I V O O
              </h1>
              <p style="margin: 6px 0 0; font-size: 10px; letter-spacing: 3px; color: #C5A059; text-transform: uppercase; font-weight: 700;">
                Atelier Luxury Fashion &bull; Order Confirmation
              </p>
            </td>
          </tr>

          <!-- ORDER HERO BANNER -->
          <tr>
            <td style="padding: 28px 24px 20px;">
              <p style="margin: 0 0 8px; font-size: 15px; color: #57534E;">
                Dear <strong style="color: #141414;">${order.customerName || 'Valued Patron'}</strong>,
              </p>
              <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 800; color: #141414; line-height: 1.2;">
                Thank you for your order!
              </h2>
              <p style="margin: 0 0 18px; font-size: 13px; color: #78716C; line-height: 1.5;">
                We are thrilled to confirm your purchase. Your handcrafted bespoke pieces are now being prepared at our fulfillment atelier with meticulous attention to detail.
              </p>

              <!-- REFERENCE & STATUS SUMMARY CARD -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E6DFC5; padding: 18px;">
                <tr>
                  <td valign="top" style="padding-bottom: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 4px;">
                      Order Reference
                    </span>
                    <strong style="font-size: 16px; color: #141414; font-family: monospace;">#${order.id}</strong>
                  </td>
                  <td align="right" valign="top" style="padding-bottom: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 4px;">
                      Payment Status
                    </span>
                    <span style="display: inline-block; background-color: ${paymentBadgeBg}; color: ${paymentStatusColor}; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${paymentStatusText}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="border-top: 1px dashed #E6DFC5; padding-top: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 2px;">
                      Payment Method
                    </span>
                    <strong style="font-size: 13px; color: #141414;">${order.paymentMethod || (isCOD ? 'Cash on Delivery' : 'Prepaid')}</strong>
                  </td>
                  <td align="right" valign="top" style="border-top: 1px dashed #E6DFC5; padding-top: 12px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 2px;">
                      Estimated Delivery
                    </span>
                    <strong style="font-size: 13px; color: #C5A059;">${estimatedDelivery}</strong>
                  </td>
                </tr>
              </table>

              ${isCOD ? `
                <!-- COD CALLOUT BANNER -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #FFFBEB; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 16px;">
                  <tr>
                    <td>
                      <p style="margin: 0 0 4px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #92400E;">
                        &#128181; Cash On Delivery &bull; Action Required Upon Delivery
                      </p>
                      <p style="margin: 0; font-size: 14px; font-weight: 700; color: #78350F;">
                        Amount to Pay Upon Delivery: <span style="font-size: 18px; color: #92400E; font-weight: 800;">${formatCurrency(finalPayable)}</span>
                      </p>
                      <p style="margin: 6px 0 0; font-size: 11px; color: #A16207; line-height: 1.4;">
                        Please keep the exact amount ready in cash or digital UPI QR when our BlueDart courier partner arrives at your shipping address.
                      </p>
                    </td>
                  </tr>
                </table>
              ` : `
                <!-- PREPAID VERIFIED BANNER -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ECFDF5; border: 1.5px solid #6EE7B7; border-radius: 12px; padding: 14px 16px;">
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #065F46;">
                        &#10003; Payment Verified: ${formatCurrency(finalPayable)} Paid in Full
                      </p>
                      <p style="margin: 4px 0 0; font-size: 11px; color: #047857;">
                        No further payment is required upon doorstep delivery. Transaction Reference: <strong style="font-family: monospace;">${order.paymentRef || 'N/A'}</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              `}
            </td>
          </tr>

          <!-- ORDER ITEMS LIST -->
          <tr>
            <td style="padding: 10px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #141414; border-bottom: 2px solid #E6DFC5; padding-bottom: 8px;">
                Ordered Items (${(order.items || []).length})
              </h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- FINANCIAL SUMMARY -->
          <tr>
            <td style="padding: 10px 24px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E6DFC5; padding: 16px;">
                <tr>
                  <td style="font-size: 13px; color: #78716C; padding-bottom: 6px;">Subtotal</td>
                  <td align="right" style="font-size: 13px; font-weight: 600; color: #141414; padding-bottom: 6px;">
                    ${formatCurrency(subtotal)}
                  </td>
                </tr>
                ${discountAmount > 0 ? `
                  <tr>
                    <td style="font-size: 13px; color: #059669; padding-bottom: 6px;">
                      Coupon Discount ${order.couponCode ? `(${order.couponCode})` : ''}
                    </td>
                    <td align="right" style="font-size: 13px; font-weight: 700; color: #059669; padding-bottom: 6px;">
                      -${formatCurrency(discountAmount)}
                    </td>
                  </tr>
                ` : ''}
                ${prepaidDiscount > 0 ? `
                  <tr>
                    <td style="font-size: 13px; color: #059669; padding-bottom: 6px;">
                      Prepaid Online Discount
                    </td>
                    <td align="right" style="font-size: 13px; font-weight: 700; color: #059669; padding-bottom: 6px;">
                      -${formatCurrency(prepaidDiscount)}
                    </td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="font-size: 13px; color: #78716C; padding-bottom: 8px;">Delivery Charges</td>
                  <td align="right" style="font-size: 13px; font-weight: 600; color: ${deliveryCharge === 0 ? '#059669' : '#141414'}; padding-bottom: 8px;">
                    ${deliveryCharge === 0 ? 'COMPLIMENTARY (FREE)' : formatCurrency(deliveryCharge)}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: 800; color: #141414; border-top: 1.5px solid #E6DFC5; padding-top: 10px;">
                    Final ${isCOD ? 'Payable Upon Delivery' : 'Amount Paid'}
                  </td>
                  <td align="right" style="font-size: 18px; font-weight: 800; color: #C5A059; border-top: 1.5px solid #E6DFC5; padding-top: 10px;">
                    ${formatCurrency(finalPayable)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING & TRACKING INFORMATION -->
          <tr>
            <td style="padding: 10px 24px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7F3EE; border-radius: 12px; border: 1px solid #E6DFC5; padding: 18px;">
                <tr>
                  <td valign="top" style="padding-bottom: 10px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 4px;">
                      &#128205; Shipping Address
                    </span>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #141414;">
                      ${order.customerName || 'Valued Customer'}
                    </p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #57534E; line-height: 1.4;">
                      ${order.address || 'Address provided at checkout'}
                    </p>
                    ${order.phone ? `<p style="margin: 2px 0 0; font-size: 12px; color: #78716C;">Phone: ${order.phone}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="border-top: 1px dashed #E6DFC5; padding-top: 10px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C827A; font-weight: 700; display: block; margin-bottom: 4px;">
                      &#128666; Logistics & Fulfillment Hub
                    </span>
                    <p style="margin: 0; font-size: 12px; color: #57534E;">
                      Carrier: <strong>${order.tracking?.carrier || 'BlueDart Express'}</strong>
                      ${order.tracking?.trackingNumber ? ` &bull; AWB: <strong style="font-family: monospace;">${order.tracking.trackingNumber}</strong>` : ''}
                    </p>
                    <p style="margin: 2px 0 0; font-size: 11px; color: #78716C;">
                      Dispatched from BRIVOO Mumbai Master Fulfillment Atelier
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER & CONCIERGE SUPPORT -->
          <tr>
            <td style="background-color: #141414; padding: 28px 24px; text-align: center; color: #A8A29E; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #C5A059; text-transform: uppercase; letter-spacing: 2px;">
                BRIVOO CONCIERGE CARE
              </p>
              <p style="margin: 0 0 12px; color: #D6D3D1;">
                Have inquiries regarding tailoring or sizing? Reach our Atelier Concierge at<br/>
                <a href="mailto:concierge@brivoo.in" style="color: #C5A059; text-decoration: none; font-weight: 600;">concierge@brivoo.in</a>
                &bull; WhatsApp: <span style="color: #FFFFFF;">+91 98000 12345</span>
              </p>
              <p style="margin: 0; font-size: 10px; color: #78716C; border-top: 1px solid #292524; padding-top: 12px;">
                &copy; ${new Date().getFullYear()} BRIVOO Luxury Atelier India. All rights reserved.<br/>
                Timeless Style. Premium You.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends order confirmation transactional email via Resend.
 *
 * Rules:
 * 1. Strictly server-side execution.
 * 2. Idempotency: Checks if email has already been sent to prevent duplicates.
 * 3. Non-blocking: If email fails, the created order remains completely intact.
 * 4. Records email status, provider messageId, and timestamp in order record.
 */
export async function sendOrderConfirmationEmail(order, db, writeData) {
  if (!order || !order.id) {
    console.warn('[Email Service] Cannot send confirmation: missing order object');
    return { success: false, error: 'Missing order' };
  }

  const recipientEmail = (order.email || '').trim().toLowerCase();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn(`[Email Service] Invalid customer email (${order.email}) for order ${order.id}`);
    return { success: false, error: 'Invalid recipient email' };
  }

  // 1. Idempotency Check: Prevent duplicate emails on webhooks or page refreshes
  if (order.emailNotification?.status === 'sent') {
    console.log(`[Email Service] Confirmation email already sent for order ${order.id} (MessageId: ${order.emailNotification.messageId}). Skipping duplicate dispatch.`);
    return {
      success: true,
      alreadySent: true,
      messageId: order.emailNotification.messageId,
      sentAt: order.emailNotification.sentAt
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'BRIVOO <noreply@brivoo.in>';

  // If Resend API key is not configured on the server, gracefully log and record
  if (!resendApiKey) {
    console.warn(`[Email Service] RESEND_API_KEY not configured in environment. Skipping email dispatch for order ${order.id}.`);
    order.emailNotification = {
      status: 'skipped',
      reason: 'RESEND_API_KEY not configured',
      timestamp: new Date().toISOString()
    };
    if (db && writeData) writeData(db);
    return { success: false, skipped: true, message: 'RESEND_API_KEY is not set' };
  }

  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cash on delivery') || (order.paymentMethod || '').toLowerCase() === 'cod';
  const subject = isCOD
    ? `Order Confirmed: #${order.id} (Cash on Delivery) - BRIVOO`
    : `Order & Payment Confirmed: #${order.id} - BRIVOO`;

  const htmlContent = generateOrderConfirmationHtml(order);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: emailFrom,
        to: recipientEmail,
        subject,
        html: htmlContent
      })
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = responseData.message || responseData.error || `Resend responded with status ${response.status}`;
      console.error(`[Email Service] Resend API error for order ${order.id}:`, errMsg);

      order.emailNotification = {
        status: 'failed',
        provider: 'resend',
        error: errMsg,
        failedAt: new Date().toISOString(),
        attempts: (order.emailNotification?.attempts || 0) + 1
      };
      if (db && writeData) writeData(db);

      return { success: false, error: errMsg };
    }

    const messageId = responseData.id || `msg_${Date.now()}`;
    console.log(`[Email Service] Order confirmation email successfully sent for order ${order.id} via Resend. MessageId: ${messageId}`);

    order.emailNotification = {
      status: 'sent',
      provider: 'resend',
      messageId,
      sentAt: new Date().toISOString(),
      recipient: recipientEmail,
      subject
    };
    if (db && writeData) writeData(db);

    return {
      success: true,
      messageId,
      sentAt: order.emailNotification.sentAt
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Email Service] Network/execution error sending email for order ${order.id}:`, errMsg);

    order.emailNotification = {
      status: 'failed',
      provider: 'resend',
      error: errMsg,
      failedAt: new Date().toISOString(),
      attempts: (order.emailNotification?.attempts || 0) + 1
    };
    if (db && writeData) writeData(db);

    // Non-blocking: Return failure without throwing, order remains completely valid
    return { success: false, error: errMsg };
  }
}
