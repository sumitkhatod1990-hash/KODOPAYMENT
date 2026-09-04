import { jsPDF } from 'jspdf';
import { Transaction } from '../types';

/** Generate and download a real PDF payment receipt without relying on a popup/print dialog. */
export function printOrDownloadInvoice(tx: Transaction, businessName = 'QivroPay') {
  const amount = Number(tx.amount || 0);
  const transactionId = String(tx.id || `qv_${Date.now()}`);
  const invoiceNumber = `INV-${transactionId.replace('tx_qivropay_', '').toUpperCase()}`;
  const date = new Date(tx.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const paymentRail = String(tx.paymentMethod || 'UPI').replace('_', ' ').toUpperCase();
  const customer = tx.customerName || 'Customer';
  const email = tx.customerEmail || '—';
  const country = String(tx.country || 'IN').toUpperCase();
  const product = tx.productName || 'QivroPay purchase';
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); const margin = 18; const right = pageWidth - margin;
  doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('QIVROPAY', margin, 17);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('PAYMENT RECEIPT', margin, 25); doc.setFontSize(10); doc.text(invoiceNumber, right, 17, { align: 'right' }); doc.text(`Issued ${date}`, right, 25, { align: 'right' });
  doc.setTextColor(31, 41, 55); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Payment successful', margin, 49);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(`Transaction ID: ${transactionId}`, margin, 57); doc.setDrawColor(226, 232, 240); doc.line(margin, 64, right, 64);
  doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.text('BILLED TO', margin, 75); doc.text('PAID TO', 112, 75);
  doc.setTextColor(31, 41, 55); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(customer, margin, 83); doc.text(businessName, 112, 83);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(email, margin, 90); doc.text('Payment collected via Cashfree', 112, 90); doc.text(`Country: ${country}`, margin, 97);
  doc.setFillColor(248, 250, 252); doc.roundedRect(margin, 110, pageWidth - margin * 2, 38, 3, 3, 'F');
  doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text('DESCRIPTION', margin + 6, 120); doc.text('PAYMENT RAIL', 112, 120); doc.text('AMOUNT', right - 6, 120, { align: 'right' });
  doc.setTextColor(31, 41, 55); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(product, margin + 6, 130); doc.setFont('helvetica', 'normal'); doc.text(paymentRail, 112, 130); doc.setFont('helvetica', 'bold'); doc.text(`₹${amount.toFixed(2)} INR`, right - 6, 130, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text('Qty 1', margin + 6, 139); doc.text('Status: Paid', 112, 139);
  doc.setTextColor(31, 41, 55); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Total paid', 112, 170); doc.setFontSize(16); doc.text(`₹${amount.toFixed(2)} INR`, right, 170, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(100, 116, 139); doc.text('This receipt is generated electronically and is valid without signature.', margin, 190); doc.text('QivroPay • Payment receipt', margin, 197);
  doc.save(`qivropay-receipt-${transactionId}.pdf`);
}
