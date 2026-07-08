import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../state/AuthContext";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Login</h1>
        <p className="muted">Sign in to continue.</p>
        <div className="hr" />

        <div style={{ display: "grid", gap: 10 }}>
          <GoogleLogin
            onSuccess={async (cred) => {
              try {
                setMsg("");
                await googleLogin(cred.credential);
                nav("/dashboard");
              } catch (e) {
                setMsg(e.message);
              }
            }}
            onError={() => setMsg("Google sign-in failed")}
          />
        </div>

        <div className="hr" />

        <form onSubmit={submit}>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            Login
          </button>

          <div className="inlineLinks" style={{ justifyContent: "space-between" }}>
            <Link className="kbd" to="/forgot-password">
              Forgot password?
            </Link>
            <span>
              New user?{" "}
              <Link className="kbd" to="/signup">
                Create account
              </Link>
            </span>
          </div>
        </form>

        {msg && <div className="msg bad">{msg}</div>}
      </div>
    </div>
  );
}
