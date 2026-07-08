const links = {
  instagram: "https://www.instagram.com/shivfurniture_house/",
  facebook: "https://facebook.com/",
  x: "https://x.com/",
  whatsapp: "https://wa.me/919917491454"
};

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  if (name === "instagram") return (
    <svg {...common}><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="2"/><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" strokeWidth="2"/><path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
  );
  if (name === "facebook") return (
    <svg {...common}><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v3H8v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1Z" fill="currentColor"/></svg>
  );
  if (name === "whatsapp") return (
    <svg {...common}><path d="M20 12a8 8 0 0 1-11.9 7L4 20l1-3.9A8 8 0 1 1 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9.2 9.4c.2-.4.4-.4.7-.4h.6c.2 0 .5.1.6.4l.7 1.7c.1.3.1.6-.1.8l-.4.5c-.2.2-.2.5 0 .8.4.7 1 1.3 1.7 1.7.3.2.6.2.8 0l.5-.4c.2-.2.5-.2.8-.1l1.7.7c.3.1.4.4.4.6v.6c0 .3 0 .5-.4.7-.6.4-1.6.5-2.6.1-1.4-.5-3-1.6-4.2-2.8S8.4 12 7.9 10.6c-.4-1-.3-2 .1-2.6Z" fill="currentColor"/></svg>
  );
  return (
    <svg {...common}><path d="M4 4l7.5 7.5M20 4l-7.5 7.5M4 20l7.5-7.5M20 20l-7.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footerGrid">
        <div>
          <div className="footerBrand">Shiv Furniture House</div>
          <p className="muted">
            Premium furniture for home & office. Order online, pay via UPI, and track delivery status.
          </p>
          <div className="footerPills">
            <a className="pill" href={links.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <Icon name="whatsapp" /> WhatsApp
            </a>
            <a className="pill" href={links.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Icon name="instagram" />
            </a>
            <a className="pill" href={links.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Icon name="facebook" />
            </a>
            <a className="pill" href={links.x} target="_blank" rel="noreferrer" aria-label="X">
              <Icon name="x" />
            </a>
          </div>
        </div>

        <div>
          <div className="footerTitle">Contact</div>
          <div className="footerList">
            <div><span className="muted">Phone:</span> <a href="tel:+919999999999">+91 99999 99999</a></div>
            <div><span className="muted">Address:</span> Raibha, Agra (UP)</div>
            <div><span className="muted">Hours:</span> 10:00 AM – 8:00 PM</div>
          </div>
        </div>

        <div>
          <div className="footerTitle">Help</div>
          <div className="footerList">
            <div className="muted">Need quick help?</div>
            <a className="bigBtn" href={links.whatsapp} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
            <div className="tiny muted">Admin verifies payment before approving your order.</div>
          </div>
        </div>
      </div>

      <div className="wrap footerBottom">
        <div>© {new Date().getFullYear()} Shiv Furniture House</div>
        <div className="tiny muted">Designed for fast checkout and easy delivery pricing.</div>
      </div>
    </footer>
  );
}
