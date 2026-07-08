import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { OrdersAPI } from "../api/orders";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    OrdersAPI.myOrders()
      .then((res) => alive && setOrders(res.orders || []))
      .catch((e) => alive && setErr(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Dashboard</h1>
        <p className="muted">Welcome, <b>{user?.name}</b> {user?.isAdmin ? "(Admin)" : ""}</p>
        <div className="hr" />

        <div className="grid3">
          <Link className="bigBtn" to="/checkout">Checkout</Link>
          <Link className="ghostBtn centerBtn" to="/">Home</Link>
          {user?.isAdmin ? <Link className="ghostBtn centerBtn" to="/admin">Admin Panel</Link> : <div />}
        </div>

        <div className="hr" />
        <div className="pill" style={{justifyContent:"space-between", width:"100%"}}>
          <b>My Orders</b><span className="muted">{loading ? "Loading..." : `${orders.length}`}</span>
        </div>
        <div style={{height:10}} />

        {err && <div className="msg bad">{err}</div>}
        <div style={{marginTop:12, display:"grid", gap:10}}>
          {orders.length === 0 && !loading && <div className="muted">No orders yet.</div>}
          {orders.map((o) => (
            <div key={o._id} className="cartRow" style={{alignItems:"center"}}>
              <div>
                <div className="cartTitle">{o.status} • ₹{o.amountRupees}</div>
                <div className="muted small">Subtotal: ₹{o.pricing?.subtotal ?? "—"} • Delivery: ₹{o.pricing?.deliveryFee ?? "—"}</div>
                <div className="muted small">{new Date(o.createdAt).toLocaleString()} • TXN: {o.transactionId || "—"}</div>
                {(o.adminRemark || o.rejectReason) && (
                  <div className="muted small">Remark: {o.adminRemark || "—"} {o.rejectReason ? ` • Reject: ${o.rejectReason}` : ""}</div>
                )}
              </div>
              <div className="pill">{o.items?.length || 0} items</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
