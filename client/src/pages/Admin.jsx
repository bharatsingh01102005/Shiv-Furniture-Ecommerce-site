import { useEffect, useMemo, useState } from "react";
import { ProductsAPI } from "../api/products";
import { OrdersAPI } from "../api/orders";
import { SettingsAPI } from "../api/settings";

const empty = { title:"", mrp: 1, discountPercent: 0, category:"Sofas", badge:"", image:"", description:"", stock:10 };

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [settings, setSettings] = useState(null);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [adminRemarkDraft, setAdminRemarkDraft] = useState({});
  const [rejectReasonDraft, setRejectReasonDraft] = useState({});
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const cats = useMemo(() => ["Sofas","Beds","Dining","Chairs","Decor","Tables","Furniture"], []);

  async function loadProducts() {
    const res = await ProductsAPI.list({});
    setProducts(res.products || []);
  }
  async function loadOrders() {
    const res = await OrdersAPI.adminAll();
    setOrders(res.orders || []);
  }

  useEffect(() => {
    loadProducts().catch(e => setMsg(e.message));
    loadOrders().catch(e => setMsg(e.message));
    SettingsAPI.adminGet().then(r=>setSettings(r.settings)).catch(()=>{});
  }, []);

  async function saveSettings() {
    setSettingsMsg("");
    try {
      if (!settings) return;
      const payload = {
        shopPincode: String(settings.shopPincode || "").trim(),
        rateUP: Number(settings.rateUP || 0),
        rateRajasthan: Number(settings.rateRajasthan || 0),
        rateOther: Number(settings.rateOther || 0),
        pincodeKmDivisor: Number(settings.pincodeKmDivisor || 100),
        minDeliveryFee: Number(settings.minDeliveryFee || 0),
        maxDeliveryFee: Number(settings.maxDeliveryFee || 999999),
        shopAddress: String(settings.shopAddress || "").trim(),
        currency: String(settings.currency || "INR").trim() || "INR"
      };
      const res = await SettingsAPI.adminUpdate(payload);
      setSettings(res.settings);
      setSettingsMsg("✅ Settings saved");
    } catch (e) {
      setSettingsMsg(e.message || "Could not save settings");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const payload = {
      title: form.title.trim(),
      mrp: Number(form.mrp),
      discountPercent: Number(form.discountPercent ?? 0),
      category: form.category,
      badge: form.badge || "",
      image: form.image || "",
      description: form.description || "",
      stock: Number(form.stock ?? 0)
    };
    try {
      if (editId) await ProductsAPI.update(editId, payload);
      else await ProductsAPI.create(payload);
      setMsg(editId ? "✅ Updated" : "✅ Added");
      setEditId(null); setForm(empty);
      await loadProducts();
    } catch (e2) { setMsg(e2.message); }
  }

  function edit(p) {
    setEditId(p._id);
    setForm({
      title: p.title || "",
      mrp: p.mrp || p.price || 1,
      discountPercent: p.discountPercent ?? p.offPercent ?? 0,
      category: p.category || "Sofas",
      badge: p.badge || "",
      image: p.image || "",
      description: p.description || "",
      stock: p.stock ?? 10
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function del(id) {
    if (!confirm("Delete product?")) return;
    setMsg("");
    try { await ProductsAPI.remove(id); setMsg("✅ Deleted"); await loadProducts(); }
    catch (e) { setMsg(e.message); }
  }

  async function setStatus(id, status) {
    setMsg("");
    try {
      const adminRemark = (adminRemarkDraft[id] || "").trim();
      const rejectReason = (rejectReasonDraft[id] || "").trim();
      await OrdersAPI.adminSetStatus(id, status, adminRemark, rejectReason);
      setMsg("✅ Order updated");
      await loadOrders();
    }
    catch (e) { setMsg(e.message); }
  }

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Admin Panel</h1>
        <p className="muted">Manage products and orders.</p>
        <div className="hr" />

        <div className="grid3">
          <button className={tab==="products" ? "primaryBtn" : "ghostBtn"} onClick={()=>setTab("products")}>Products</button>
          <button className={tab==="orders" ? "primaryBtn" : "ghostBtn"} onClick={()=>setTab("orders")}>Orders</button>
          <button className={tab==="settings" ? "primaryBtn" : "ghostBtn"} onClick={()=>setTab("settings")}>Settings</button>
        </div>

        {tab==="products" && (
          <>
            <div className="hr" />
            
            {/* Add/Edit Form */}
            <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
              <b>{editId ? "Edit Product" : "Add New Product"}</b>
              {editId && <button className="ghostBtn small" onClick={()=>{setEditId(null); setForm(empty);}}>Cancel</button>}
            </div>

            <form onSubmit={submit} className="stack" style={{marginTop:12, gap:12}}>
              <div className="grid2">
                <div>
                  <label className="label">Product Name *</label>
                  <input 
                    className="input" 
                    required
                    placeholder="e.g. Leather Sofa"
                    value={form.title} 
                    onChange={(e)=>setForm({...form, title:e.target.value})} 
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select 
                    className="input" 
                    value={form.category}
                    onChange={(e)=>setForm({...form, category:e.target.value})}
                  >
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid3">
                <div>
                  <label className="label">MRP (₹) *</label>
                  <input 
                    className="input" 
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={form.mrp} 
                    onChange={(e)=>setForm({...form, mrp: Number(e.target.value) || 1})} 
                  />
                </div>
                <div>
                  <label className="label">Discount (%)</label>
                  <input 
                    className="input" 
                    type="number"
                    min="0"
                    max="95"
                    placeholder="0-95%"
                    value={form.discountPercent} 
                    onChange={(e)=>setForm({...form, discountPercent: Number(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input 
                    className="input" 
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={form.stock} 
                    onChange={(e)=>setForm({...form, stock: Number(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div>
                <label className="label">Product Image URL</label>
                <input 
                  className="input" 
                  placeholder="https://example.com/image.jpg"
                  value={form.image} 
                  onChange={(e)=>setForm({...form, image:e.target.value})} 
                />
                {form.image && (
                  <div style={{marginTop:8, maxWidth:200}}>
                    <img src={form.image} alt="preview" style={{maxWidth:"100%", borderRadius:4}} />
                  </div>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  style={{minHeight:80, fontFamily:"inherit"}}
                  placeholder="Product details (max 300 characters)"
                  maxLength="300"
                  value={form.description} 
                  onChange={(e)=>setForm({...form, description:e.target.value})} 
                />
                <div className="muted small" style={{marginTop:4}}>{form.description.length}/300</div>
              </div>

              <div>
                <label className="label">Badge (Optional)</label>
                <input 
                  className="input" 
                  placeholder="e.g. New, Sale, Featured"
                  value={form.badge} 
                  onChange={(e)=>setForm({...form, badge:e.target.value})} 
                />
              </div>

              {msg && <div className="msg" style={{marginTop:8}}>{msg}</div>}
              <button className="bigBtn" type="submit">{editId ? "Update Product" : "Add Product"}</button>
            </form>

            <div className="hr" style={{marginTop:24}} />

            {/* Products List */}
            <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
              <b>All Products</b>
              <span className="muted">{products.length}</span>
            </div>

            <div className="cartBox">
              {products.length === 0 && <div className="muted" style={{padding:14}}>No products yet. Add one above!</div>}
              {products.map((p) => (
                <div className="cartRow" key={p._id} style={{alignItems:"flex-start"}}>
                  {p.image && (
                    <img 
                      src={p.image} 
                      alt={p.title}
                      style={{width:80, height:80, objectFit:"cover", borderRadius:4, marginRight:12}}
                    />
                  )}
                  <div style={{minWidth: 240, flex:1}}>
                    <div className="cartTitle">{p.title}</div>
                    <div className="muted small">{p.category}</div>
                    <div className="muted small">₹{p.price} (MRP ₹{p.mrp}, {p.discountPercent}% off)</div>
                    <div className="muted small">Stock: {p.stock} | {p.badge && `Badge: ${p.badge}`}</div>
                  </div>
                  <div className="rowActions">
                    <button className="ghostBtn" onClick={() => edit(p)}>Edit</button>
                    <button className="ghostBtn" style={{color:"#d32f2f"}} onClick={() => del(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="orders" && (
          <>
            <div className="hr" />
            <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
              <b>All Orders</b>
              <span className="muted">{orders.length}</span>
            </div>

            <div className="cartBox">
              {orders.length === 0 && <div className="muted" style={{padding:14}}>No orders yet.</div>}
              {orders.map((o) => (
                <div className="cartRow" key={o._id} style={{alignItems:"flex-start"}}>
                  <div style={{minWidth: 240}}>
                    <div className="cartTitle">{o.status} • ₹{o.amountRupees}</div>
                    <div className="muted small">TXN: {o.transactionId || "—"} • {new Date(o.createdAt).toLocaleString()}</div>
                    <div className="muted small">Subtotal: ₹{o.pricing?.subtotal ?? "—"} • Delivery: ₹{o.pricing?.deliveryFee ?? "—"}</div>
                    {(o.adminRemark || o.rejectReason) && (
                      <div className="muted small">Remark: {o.adminRemark || "—"} {o.rejectReason ? ` • Reject: ${o.rejectReason}` : ""}</div>
                    )}
                    <div className="muted small" style={{marginTop:6}}>{(o.items||[]).map(i => `${i.title}×${i.qty}`).join(", ")}</div>
                  </div>

                  <div style={{flex:1, minWidth: 260}}>
                    <div className="stack">
                      <input
                        className="input"
                        style={{marginTop:0}}
                        placeholder="Remark (optional)"
                        value={adminRemarkDraft[o._id] ?? o.adminRemark ?? ""}
                        onChange={(e)=>setAdminRemarkDraft(prev=>({...prev,[o._id]:e.target.value}))}
                      />
                      <input
                        className="input"
                        style={{marginTop:0}}
                        placeholder="Reject reason (if rejecting)"
                        value={rejectReasonDraft[o._id] ?? o.rejectReason ?? ""}
                        onChange={(e)=>setRejectReasonDraft(prev=>({...prev,[o._id]:e.target.value}))}
                      />
                      <div className="rowActions">
                        {["PENDING","PAID","SHIPPED","DELIVERED"].map((s) => (
                          <button key={s} className="ghostBtn" onClick={()=>setStatus(o._id, s)}>{s}</button>
                        ))}
                        <button className="ghostBtn" onClick={()=>setStatus(o._id, "REJECTED")}>REJECT</button>
                        <button className="ghostBtn" onClick={()=>setStatus(o._id, "CANCELLED")}>CANCEL</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="settings" && (
          <>
            <div className="hr" />
            <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
              <b>Settings</b>
              <span className="muted">Delivery configuration</span>
            </div>

            {!settings ? (
              <div className="loadingCard" style={{marginTop:12}}>Loading settings…</div>
            ) : (
              <>
                <div className="grid3" style={{marginTop:12}}>
                  <div>
                    <label className="label">Shop Pincode</label>
                    <input className="input" value={settings.shopPincode || ""} onChange={(e)=>setSettings({...settings, shopPincode: e.target.value})} placeholder="e.g. 282001" />
                  </div>
                  <div>
                    <label className="label">Pincode Km Divisor</label>
                    <input className="input" type="number" min={1} value={settings.pincodeKmDivisor ?? 100} onChange={(e)=>setSettings({...settings, pincodeKmDivisor: Number(e.target.value)})} />
                    <div className="muted small" style={{marginTop:8}}>Distance ≈ |dest - shop| / divisor</div>
                  </div>
                  <div>
                    <label className="label">Shop Address (optional)</label>
                    <input className="input" value={settings.shopAddress || ""} onChange={(e)=>setSettings({...settings, shopAddress: e.target.value})} placeholder="Raibha, Agra, Uttar Pradesh" />
                  </div>
                </div>

                <div className="grid3" style={{marginTop:12}}>
                  <div>
                    <label className="label">₹/km (Uttar Pradesh)</label>
                    <input className="input" type="number" min={0} value={settings.rateUP ?? 0} onChange={(e)=>setSettings({...settings, rateUP: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="label">₹/km (Rajasthan)</label>
                    <input className="input" type="number" min={0} value={settings.rateRajasthan ?? 0} onChange={(e)=>setSettings({...settings, rateRajasthan: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="label">₹/km (Other states)</label>
                    <input className="input" type="number" min={0} value={settings.rateOther ?? 0} onChange={(e)=>setSettings({...settings, rateOther: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid2" style={{marginTop:12}}>
                  <div>
                    <label className="label">Minimum delivery fee (₹)</label>
                    <input className="input" type="number" min={0} value={settings.minDeliveryFee ?? 0} onChange={(e)=>setSettings({...settings, minDeliveryFee: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="label">Maximum delivery fee (₹)</label>
                    <input className="input" type="number" min={0} value={settings.maxDeliveryFee ?? 999999} onChange={(e)=>setSettings({...settings, maxDeliveryFee: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid2" style={{marginTop:14}}>
                  <button className="bigBtn" type="button" onClick={saveSettings}>Save Settings</button>
                  <button className="ghostBtn" type="button" onClick={()=>SettingsAPI.adminGet().then(r=>setSettings(r.settings)).catch(()=>{})}>Reload</button>
                </div>
                {settingsMsg && <div className="msg" style={{marginTop:12}}>{settingsMsg}</div>}
              </>
            )}
          </>
        )}


      </div>
    </div>
  );
}
