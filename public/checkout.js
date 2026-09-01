/**
 * QIVROPAY Payments — Embeddable JavaScript SDK
 * Usage:
 *   <script src="https://js.qivropay.io/v1/checkout.js"></script>
 *   QivroPay.openCheckout({ sessionId: 'cs_qivropay_...' });
 */
(function (window) {
  const QivroPay = {
    openCheckout: function (options) {
      const sessionId = options.sessionId || 'demo_session';
      const checkoutUrl = (options.origin || window.location.origin) + '/checkout/' + sessionId;

      // Create modal iframe
      const overlay = document.createElement('div');
      overlay.id = 'qivropay-checkout-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      overlay.style.backdropFilter = 'blur(10px)';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';

      const iframe = document.createElement('iframe');
      iframe.src = checkoutUrl;
      iframe.style.width = '100%';
      iframe.style.maxWidth = '640px';
      iframe.style.height = '90vh';
      iframe.style.maxHeight = '780px';
      iframe.style.borderRadius = '24px';
      iframe.style.border = 'none';
      iframe.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

      overlay.appendChild(iframe);
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });
    }
  };

  window.QivroPay = QivroPay;
})(window);
