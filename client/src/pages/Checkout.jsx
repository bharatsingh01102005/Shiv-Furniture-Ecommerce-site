import { useEffect, useMemo, useState } from "react";
import { useCart } from "../state/CartContext";
import { OrdersAPI } from "../api/orders";
import { SettingsAPI } from "../api/settings";

function buildUpiUrl({ upiId, name, amount }) {
  const pa = encodeURIComponent(upiId);
  const pn = name || "Shiv%20Furniture%20House";
  const am = encodeURIComponent(String(amount));
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
}

// Delivery is calculated using only PINCODE (no lat/lng inputs).

export default function Checkout() {
  const { items, setQty, remove, clear, totalRupees } = useCart();

  const [msg, setMsg] = useState("");
  const [txn, setTxn] = useState("");
  const [settings, setSettings] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteMsg, setQuoteMsg] = useState("");

  const [ship, setShip] = useState({
    name: "",
    phone: "",
    line1: "",
    area: "",
    city: "Agra",
    state: "Uttar Pradesh",
    pincode: "",
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    SettingsAPI.public()
      .then((res) => setSettings(res.settings))
      .catch(() => setSettings(null));
  }, []);

  const subtotal = totalRupees();
  const deliveryFee = Number(quote?.deliveryFee || 0);
  const total = subtotal + deliveryFee;

  const upiId = import.meta.env.VITE_UPI_ID || "yourupi@bank";
  const merchant = import.meta.env.VITE_MERCHANT_NAME || "Shiv%20Furniture%20House";
  const upiUrl = useMemo(() => buildUpiUrl({ upiId, name: merchant, amount: total }), [upiId, merchant, total]);

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      setMsg("Geolocation not supported in your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          // Extract address components
          const address = data.address || {};
          setShip(prev => ({
            ...prev,
            line1: `${address.house_number || ""} ${address.road || address.street || ""}`.trim(),
            area: address.suburb || address.village || address.city_district || "",
            city: address.city || address.town || prev.city,
            state: address.state || prev.state,
            pincode: address.postcode || "",
            latitude,
            longitude
          }));
          setMsg("✅ Location detected");
          setTimeout(() => setMsg(""), 3000);
        } catch (e) {
          setMsg("Could not get address details from location");
        }
      },
      (error) => {
        setMsg(`Location error: ${error.message}`);
      }
    );
  }

  async function calcDelivery() {
    setQuoteMsg("");
    setQuote(null);
    try {
      if (!ship.pincode || ship.pincode.trim().length < 4) {
        return setQuoteMsg("Enter pincode and then click Calculate Delivery");
      }
      const res = await OrdersAPI.deliveryQuote({
        pincode: ship.pincode.trim(),
        state: ship.state,
        latitude: ship.latitude,
        longitude: ship.longitude
      });
      setQuote(res.quote);
      setQuoteMsg("Delivery updated ✅");
    } catch (e) {
      setQuoteMsg(e.message || "Could not calculate delivery");
    }
  }

  async function placeOrder() {
    setMsg("");
    try {
      if (items.length === 0) return setMsg("Cart is empty");
      if (!txn || txn.trim().length < 4) return setMsg("Please enter Transaction ID after payment");
      if (!ship.name || ship.name.trim().length < 2) return setMsg("Enter your name");
      if (!ship.phone || ship.phone.trim().length < 7) return setMsg("Enter phone number");
      if (!ship.line1 || ship.line1.trim().length < 3) return setMsg("Enter address");
      if (!ship.pincode || ship.pincode.trim().length < 4) return setMsg("Enter pincode");
      if (!quote) return setMsg("Click Calculate Delivery first");

      await OrdersAPI.create(
        items.map((it) => ({ productId: it.productId, qty: it.qty })),
        txn.trim(),
        ship
      );

      clear();
      window.location.href = "/success";
    } catch (e) {
      setMsg(e.message || "Order error");
    }
  }

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Checkout</h1>
        <p className="muted">No return policy • Please pay via UPI and enter Transaction ID to place your order.</p>

        <div className="hr" />

        <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
          <span><b>Delivery pricing</b></span>
          <span className="muted">{settings ? "Pincode-based" : "Loading..."}</span>
        </div>

        <div className="grid2" style={{marginTop:12}}>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={ship.name} onChange={(e)=>setShip({...ship, name:e.target.value})} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={ship.phone} onChange={(e)=>setShip({...ship, phone:e.target.value})} placeholder="Mobile number" />
          </div>
        </div>

        <button type="button" className="ghostBtn" onClick={getCurrentLocation} style={{marginTop:12, width:"100%"}}>📍 Use Current Location</button>

        <label className="label">Address</label>
        <input className="input" value={ship.line1} onChange={(e)=>setShip({...ship, line1:e.target.value})} placeholder="House no, street, landmark" />

        <div className="grid3" style={{marginTop:12}}>
          <div>
            <label className="label">Area</label>
            <input className="input" value={ship.area} onChange={(e)=>setShip({...ship, area:e.target.value})} placeholder="Optional" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={ship.city} onChange={(e)=>setShip({...ship, city:e.target.value})} />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className="input" value={ship.pincode} onChange={(e)=>setShip({...ship, pincode:e.target.value})} />
          </div>
        </div>

        <div className="grid2" style={{marginTop:12}}>
          <div>
            <label className="label">State</label>
            <input className="input" value={ship.state} onChange={(e)=>setShip({...ship, state:e.target.value})} />
          </div>
          <div>
            <label className="label">Delivery</label>
            <div className="grid2" style={{gap:10}}>
              <button type="button" className="ghostBtn" onClick={calcDelivery}>Calculate Delivery</button>
              <div className="pill" style={{justifyContent:"center"}}>{quote ? `₹${deliveryFee}` : "Not calculated"}</div>
            </div>
            {quoteMsg && <div className="muted small" style={{marginTop:8}}>{quoteMsg}</div>}
          </div>
        </div>

        <div className="hr" />

        <div className="cartBox">
          {items.length === 0 && <div className="muted">Your cart is empty. Add products from Home.</div>}
          {items.map((it) => (
            <div className="cartRow" key={it.productId} style={{alignItems:"center"}}>
              <div>
                <div className="cartTitle">{it.title}</div>
                <div className="muted small">₹{it.price} each</div>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
                <input className="input qtyInput" style={{marginTop:0, padding:"10px 12px"}} type="number" min={1} value={it.qty} onChange={(e)=>setQty(it.productId, e.target.value)} />
                <div className="cartPrice">₹{it.qty * it.price}</div>
                <button className="ghostBtn" onClick={()=>remove(it.productId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="hr" />

        <div className="grid3">
          <div className="pill" style={{justifyContent:"space-between"}}><span className="muted">Subtotal</span><b>₹{subtotal}</b></div>
          <div className="pill" style={{justifyContent:"space-between"}}><span className="muted">Delivery</span><b>₹{deliveryFee}</b></div>
          <div className="pill" style={{justifyContent:"space-between"}}><span className="muted">Total</span><b>₹{total}</b></div>
        </div>

        <div className="hr" />

        <a className="bigBtn fullBtn" href={upiUrl}>Pay via UPI App (₹{total})</a>

        <label className="label">Transaction ID</label>
        <input className="input" value={txn} onChange={(e)=>setTxn(e.target.value)} placeholder="e.g. 234567890123" />

        <button className="bigBtn fullBtn" onClick={placeOrder}>Place Order</button>
        {msg && <div className="msg bad">{msg}</div>}
      </div>
    </div>
  );
}
