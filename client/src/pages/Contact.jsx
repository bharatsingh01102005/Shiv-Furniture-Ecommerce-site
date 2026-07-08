export default function Contact() {
  return (
    <main className="page">
      <section className="pageHero">
        <div className="wrap">
          <div className="crumb">Home / Contact</div>
          <h1 className="pageTitle">Contact Us</h1>
          <p className="pageSub">
            Need help choosing a product, checking delivery, or a custom order? Reach us anytime.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div className="card softCard">
            <h2>Store & Support</h2>
            <div className="infoGrid">
              <div>
                <div className="infoLabel">Phone</div>
                <a className="infoValue" href="tel:+919917491454">+91 99174 91454</a>
              </div>
              <div>
                <div className="infoLabel">WhatsApp</div>
                <a className="infoValue" href="https://wa.me/919917491454" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
              </div>
              <div>
                <div className="infoLabel">Email</div>
                <a className="infoValue" href="mailto:help.shivfurniture@gmail.com">help.shivfurniture@gmail.com</a>
              </div>
              <div>
                <div className="infoLabel">Address</div>
                <div className="infoValue">Raibha, Agra (UP)</div>
              </div>
              <div>
                <div className="infoLabel">Hours</div>
                <div className="infoValue">10:00 AM – 8:00 PM (Mon–Sun)</div>
              </div>
            </div>

            <div className="ctaRow" style={{ marginTop: 18 }}>
              <a className="bigBtn" href="https://wa.me/919917491454" target="_blank" rel="noreferrer">
                Start WhatsApp Chat
              </a>
              <a className="ghostBtn" href="tel:+919917491454">Call Now</a>
            </div>
          </div>

          <div className="card softCard">
            <h2>Quick note</h2>
            <p className="muted">
              This site uses UPI payment confirmation. After payment, submit your transaction ID at checkout.
              Admin will verify and approve or reject with a reason.
            </p>

            <div className="noteBox">
              <div className="noteTitle">No Return Policy</div>
              <div className="muted">
                Please check size, color and details carefully before placing the order.
                For manufacturing defects, contact support within 24 hours of delivery.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
