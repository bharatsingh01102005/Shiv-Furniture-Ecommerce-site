import { Routes, Route } from "react-router-dom";
import PromoBar from "./ui/PromoBar";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import ProtectedRoute from "./ui/ProtectedRoute";
import AdminRoute from "./ui/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="appShell">
      <PromoBar />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
      <Footer />
    </div>
  );
}
