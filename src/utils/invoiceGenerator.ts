import { Transaction } from '../types';

export function printOrDownloadInvoice(tx: Transaction, businessName = 'KODO AI Technologies Inc.') {
  const currency = 'INR';
  const symbol = '₹';
  const country = String(tx.country || 'IN').toUpperCase();
  const amount = Number(tx.amount || 0);
  const transactionId = String(tx.id || `qv_${Date.now()}`);
  const invoiceNumber = `INV-${transactionId.replace('tx_kodo_', '').toUpperCase()}`;
  const invoiceDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Open synchronously from the click handler so browsers do not classify it
  // as a popup. The new document can be saved as a real PDF via print dialog.
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Invoice window blocked. Please allow pop-ups for qivropay.com, then click the invoice button again.');
    return;
  }

  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoiceNumber} - KODO Payments</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1d1d1f;
      background: #ffffff;
      margin: 0;
      padding: 40px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #e5e5ea;
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.04);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #e5e5ea;
      padding-bottom: 28px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #000000;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: bold;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      background: #e8f5e9;
      color: #2e7d32;
      margin-top: 6px;
    }
    .inv-details {
      text-align: right;
      font-size: 13px;
      color: #6e6e73;
    }
    .inv-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #1d1d1f;
      margin-bottom: 4px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
      font-size: 13px;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #86868b;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .value {
      color: #1d1d1f;
      font-weight: 500;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 12px 16px;
      background: #f5f5f7;
      color: #86868b;
      font-size: 11px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }
    td {
      padding: 16px;
      border-bottom: 1px solid #e5e5ea;
    }
    .table-right {
      text-align: right;
    }
    .total-box {
      margin-left: auto;
      width: 280px;
      font-size: 13px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #6e6e73;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      padding: 14px 0;
      border-top: 2px solid #000000;
      font-size: 16px;
      font-weight: 800;
      color: #000000;
    }
    .footer-note {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e5ea;
      font-size: 11px;
      color: #86868b;
      line-height: 1.6;
      text-align: center;
    }
    @media print {
      body { padding: 0; background: transparent; }
      .container { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">KODO PAYMENTS</div>
        <div class="badge">Merchant of Record • Paid</div>
      </div>
      <div class="inv-details">
        <div class="inv-num">${invoiceNumber}</div>
        <div>Date: ${invoiceDate}</div>
        <div>Status: Settled (Success)</div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="label">Billed To (Customer)</div>
        <div class="value">
          <strong>${tx.customerName}</strong><br />
          ${tx.customerEmail}<br />
          Jurisdiction: ${country}
        </div>
      </div>
      <div>
        <div class="label">Seller of Record (MoR)</div>
        <div class="value">
          <strong>KODO Payments Inc.</strong><br />
          Operating Reseller for ${businessName}<br />
          Tax Nexus ID: EU37209182 / US-DEL-9941
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th class="table-right">Unit Price</th>
          <th class="table-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${tx.productName}</strong><br />
            <span style="font-size: 11px; color: #86868b;">Payment Rail: ${tx.paymentMethod.toUpperCase().replace('_', ' ')} ${tx.cardLast4 ? `(•${tx.cardLast4})` : ''}</span>
          </td>
          <td>1</td>
          <td class="table-right">${symbol}${amount.toFixed(2)}</td>
          <td class="table-right"><strong>${symbol}${amount.toFixed(2)} ${currency}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${symbol}${amount.toFixed(2)} ${currency}</span>
      </div>
      <div class="total-row">
        <span>VAT / Sales Tax</span>
        <span style="color: #2e7d32; font-weight: 600;">${symbol}0.00 (MoR Auto-Remitted)</span>
      </div>
      <div class="grand-total">
        <span>Total Paid</span>
        <span>${symbol}${amount.toFixed(2)} ${currency}</span>
      </div>
    </div>

    <div class="footer-note">
      KODO Payments Inc. operates as the authorized Merchant of Record and legal reseller. All applicable value-added taxes (VAT), goods and services taxes (GST), and US sales taxes are calculated, collected, and remitted directly by KODO under its global tax registrations.
    </div>

    <div class="no-print" style="margin-top: 32px; text-align: center;">
      <button onclick="window.print()" style="background: #000000; color: #ffffff; border: none; padding: 12px 28px; font-weight: bold; border-radius: 999px; cursor: pointer; font-size: 13px;">
        Print / Save PDF
      </button>
    </div>
  </div>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    try { printWindow.print(); } catch {}
  }, 350);
}
