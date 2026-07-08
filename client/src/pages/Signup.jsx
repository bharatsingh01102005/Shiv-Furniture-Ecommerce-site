import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await signup(name, email, password, phone || undefined);
      nav("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Create Account</h1>
        <p className="muted">Create your account.</p>
        <div className="hr" />
        <form onSubmit={submit}>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="label">
            Mobile (optional, for OTP)
          </label>
          <input
            className="input"
            placeholder="+919917491454"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button className="bigBtn fullBtn" type="submit">
            Sign up
          </button>
        </form>
        {msg && <div className="msg bad">{msg}</div>}
        <div className="inlineLinks">
          Already have account? <Link className="kbd" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
