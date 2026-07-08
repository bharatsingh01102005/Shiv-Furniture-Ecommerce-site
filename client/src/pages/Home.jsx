import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductsAPI } from "../api/products";
import { useCart } from "../state/CartContext";
import { useAuth } from "../state/AuthContext";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}


function formatINR(n){
  const x = Math.round(Number(n || 0));
  return new Intl.NumberFormat("en-IN").format(x);
}

export default function Home() {
  const navigate = useNavigate();
  const qs = useQuery();
  const search = qs.get("search") || "";
  const category = qs.get("category") || "";

  const { add } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true); setErr("");
    ProductsAPI.list({ search, category })
      .then((res) => alive && setProducts(res.products || []))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [search, category]);

  return (
    <main>
      <section className="heroV2">
  <div className="wrap heroV2Grid">
    <div className="heroCopy">
      <div className="kicker">More than 30 years of expertise</div>
      <h1 className="heroTitle">Furniture that<br/>feels premium.</h1>
      <p className="heroSub">
        Explore sofas, beds, dining and more — clean pricing, easy UPI checkout, and delivery quote by PIN code.
      </p>
      <div className="heroCta">
        <a className="bigBtn" href="#products">Shop Products</a>
        <button className="ghostBtn" type="button" onClick={() => navigate("/contact")}>Get Help</button>
        <span className="pill">Hello, <b>{user?.name || "Guest"}</b></span>
      </div>

      <div className="featRow">
        <div className="feat"><span className="featIco">🚚</span><div><b>Fast Delivery</b><div className="muted">By pincode quote</div></div></div>
        <div className="feat"><span className="featIco">🛠️</span><div><b>Quality Build</b><div className="muted">Durable material</div></div></div>
        <div className="feat"><span className="featIco">💳</span><div><b>UPI Payments</b><div className="muted">Verified by admin</div></div></div>
      </div>
    </div>

    <div className="heroMediaV2" aria-label="Hero image">
      <div className="heroImgV2" />
      <div className="heroBadge">
        <div className="heroBadgeT">Today’s Picks</div>
        <div className="muted">Sofa • Bed • Dining</div>
      </div>
    </div>
  </div>
</section>


<section className="section quickCats">
  <div className="wrap">
    <div className="quickHead">
      <h2 className="sectionTitle">Featured Categories</h2>
      <p className="muted">Browse popular categories the way you like.</p>
    </div>

    <div className="quickGrid">
      {[
        {
          title: "Luxury Sofas",
          sub: "Comfort with character",
          cat: "Sofas",
          img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=70"
        },
        {
          title: "Wooden Beds",
          sub: "Strong, warm & timeless",
          cat: "Beds",
          img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=70"
        },
        {
          title: "Dining Sets",
          sub: "For everyday gatherings",
          cat: "Dining",
          img: "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=1200&q=70"
        },
        {
          title: "Office Chairs",
          sub: "Ergonomic comfort",
          cat: "Chairs",
          img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=70"
        }
      ].map((c) => (
        <div className="quickCard" key={c.cat}>
          <div className="quickImg" style={{ backgroundImage: `url(${c.img})` }} aria-label={c.title} />
          <div className="quickBody">
            <div className="quickTitle">{c.title}</div>
            <div className="muted">{c.sub}</div>
            <button
              className="smallBtn"
              onClick={() => {
                navigate(`/?category=${encodeURIComponent(c.cat)}`);
                setTimeout(() => {
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      <section className="section" id="products">
        <div className="wrap">
          <div className="pill" style={{justifyContent:"space-between", width:"100%", gap:12}}>
            <span><b>Products</b> {category ? `• ${category}` : ""} {search ? `• “${search}”` : ""}</span>
            <span className="muted">MongoDB</span>
          </div>

          {loading && <div className="loadingCard" style={{marginTop:16}}>Loading products...</div>}
          {err && <div className="msg bad">{err}</div>}

          <div className="cards" style={{marginTop:18}}>
            {products.map((p) => (
              <div className="card productCard" key={p._id}>
                {(p.discountPercent || 0) > 0 && (
                  <div className="offerStamp" aria-label="Offer">{`-${Math.round(p.discountPercent)}%`}</div>
                )}
                
                <div style={{borderRadius:20, overflow:"hidden", border:"1px solid rgba(231,232,238,1)", background:"#fff", height:180, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  {p.image ? (
                    <img className="prodImg" src={p.image} alt={p.title} loading="lazy" onError={(e)=>{e.currentTarget.style.display="none";}} />
                  ) : (
                    <div className="prodImgPh" aria-label="No image">No Image</div>
                  )}
                </div>
<h3>{p.title}</h3>
                <p className="muted">{p.description || "Premium quality product."}</p>
                
<div className="priceRow">
  {(p.discountPercent || 0) > 0 && (
    <span className="mrp">₹{formatINR(p.mrp || p.price)}</span>
  )}
  <span className="final">₹{formatINR(p.price)}</span>
</div>
                <button className="smallBtn" onClick={() => add(p, 1)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
