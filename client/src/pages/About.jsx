export default function About() {
  return (
    <main className="page">
      <section className="pageHero">
        <div className="wrap">
          <div className="crumb">Home / About</div>
          <h1 className="pageTitle">About Shiv Furniture House</h1>
          <p className="pageSub">
            We build furniture that feels premium, lasts long, and fits your space.
            From sofas to beds and custom orders — we’re here to help you furnish smarter.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div className="card softCard">
            <h2>All‑in‑one furniture solution</h2>
            <p className="muted">
              Shopping should be simple. Browse products, add to cart, pay via UPI,
              and track status from your dashboard.
            </p>
            <ul className="checkList">
              <li>Transparent pricing (MRP + Discount)</li>
              <li>Delivery cost by PIN code</li>
              <li>Admin approval workflow for orders</li>
              <li>No return policy (as displayed at checkout)</li>
            </ul>
          </div>

          <div className="card softCard">
            <h2>We specialize in</h2>
            <p className="muted">Strong materials + clean finishing + practical designs.</p>
            <div className="grid2">
              <div className="mini">
                <div className="miniTitle">Aesthetic appeal</div>
                <div className="muted">Modern silhouettes with timeless comfort.</div>
              </div>
              <div className="mini">
                <div className="miniTitle">Durability</div>
                <div className="muted">Built for everyday use and long life.</div>
              </div>
              <div className="mini">
                <div className="miniTitle">Moisture‑resistant</div>
                <div className="muted">Better protection for Indian weather.</div>
              </div>
              <div className="mini">
                <div className="miniTitle">Custom options</div>
                <div className="muted">Size, finish, and fabric choices.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section softSection">
        <div className="wrap">
          <h2 className="sectionTitle">Customer reviews</h2>
          <p className="muted">Real feedback from happy customers.</p>

          <div className="cards" style={{ marginTop: 18 }}>
            {[
              { n: "Rahul", t: "Great finishing and timely delivery. Really satisfied." },
              { n: "Neha", t: "Good quality products. Helpful staff and smooth experience." },
              { n: "Amit", t: "Value for money. The sofa is super comfortable." }
            ].map((r) => (
              <div key={r.n} className="card reviewCard">
                <div className="reviewTop">
                  <div className="avatar">{r.n[0]}</div>
                  <div>
                    <div className="reviewName">{r.n}</div>
                    <div className="stars">★★★★★</div>
                  </div>
                </div>
                <p className="muted">{r.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
