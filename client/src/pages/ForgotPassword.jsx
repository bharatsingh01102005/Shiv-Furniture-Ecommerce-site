import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth";

export default function ForgotPassword() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1); // 1=request, 2=reset
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestOtp(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await AuthAPI.requestResetOtp(email);
      setStep(2);
      setMsg("OTP sent to your email. Please check inbox/spam.");
    } catch (err) {
      setMsg(err.message || "Unable to send OTP");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await AuthAPI.resetPasswordWithOtp({ email, otp, newPassword });
      setMsg("Password updated. Please login.");
      setTimeout(() => nav("/login"), 800);
    } catch (err) {
      setMsg(err.message || "Unable to reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pageWrap">
      <div className="formWrap">
        <h1 className="formTitle">Forgot Password</h1>
        <p className="muted">We will send a 6-digit OTP to your email.</p>

        <div className="hr" />

        {msg ? <div className="msg bad" style={{ marginBottom: 12 }}>{msg}</div> : null}

        {step === 1 ? (
          <form onSubmit={requestOtp}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

            <button className="bigBtn fullBtn" disabled={busy}>
              {busy ? "Sending..." : "Send OTP"}
            </button>

            <div className="inlineLinks" style={{ marginTop: 12 }}>
              <Link className="muted" to="/login">Back to login</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label className="label">OTP</label>
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" required />

            <label className="label">New Password</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required />

            <button className="bigBtn fullBtn" disabled={busy}>
              {busy ? "Updating..." : "Reset Password"}
            </button>

            <div className="inlineLinks" style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
              <button type="button" className="ghostBtn" onClick={() => setStep(1)} disabled={busy}>
                Resend OTP
              </button>
              <Link className="muted" to="/login">Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
