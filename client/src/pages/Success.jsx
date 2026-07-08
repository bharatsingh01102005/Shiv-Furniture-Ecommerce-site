import { Link } from "react-router-dom";
export default function Success(){
  return (
    <div className="pageWrap">
      <div className="formWrap center">
        <h1 className="formTitle">Order Placed ✅</h1>
        <p className="muted">We have received your order. You can track status in your dashboard.</p>
        <div className="hr" />
        <div className="grid2">
          <Link className="bigBtn" to="/dashboard">Dashboard</Link>
          <Link className="ghostBtn centerBtn" to="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
