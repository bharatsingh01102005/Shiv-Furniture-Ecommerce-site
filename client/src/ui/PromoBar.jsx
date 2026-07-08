export default function PromoBar() {
  return (
    <div className="topbar">
      <div className="wrap topbarRow">
        <div className="topbarLeft">
          <span className="dot" />
          <span><b>Shiv Furniture House</b> • Quality furniture • Easy UPI payments</span>
        </div>

        <div className="topbarRight">
          <a className="topbarLink" href="tel:+919917491454">Call: +91 99174 91454</a>
          <span className="sep">|</span>
          <a
            className="topbarLink"
            href="https://wa.me/919917491454"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}
