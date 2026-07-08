import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import { useMemo, useState } from "react";

const CATEGORIES = ["Sofas", "Beds", "Dining", "Chairs", "Wardrobes", "Tables", "More"];

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState(false);

  const cartCount = useMemo(
    () => (items || []).reduce((a, it) => a + (it.qty || 0), 0),
    [items]
  );

  function goSearch() {
    const v = String(q || "").trim();
    nav(v ? `/?search=${encodeURIComponent(v)}` : "/");
    if (window.location.pathname === "/") {
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }

  return (
    <header className="siteHeader">
      <div className="wrap headerGrid">
        <Link to="/" className="brand">
          <span className="brandMark">SF</span>
          <span className="brandText">
            <span className="brandTitle">Shiv Furniture</span>
            <span className="brandSub">Home • Office • Custom</span>
          </span>
        </Link>

        <nav className="navLinks" aria-label="Primary">
          <Link to="/" className="navA">Home</Link>

          <div
            className="navDrop"
            onMouseEnter={() => setOpenCats(true)}
            onMouseLeave={() => setOpenCats(false)}
          >
            <button
              className={"navA navDropBtn" + (openCats ? " active" : "")}
              type="button"
              onClick={() => setOpenCats((s) => !s)}
              aria-expanded={openCats}
            >
              Categories <span className="chev">▾</span>
            </button>

            {openCats && (
              <div className="navMenu" role="menu">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className="menuItem"
                    role="menuitem"
                    onClick={() => {
                      setOpenCats(false);
                      nav(`/?category=${encodeURIComponent(c)}`);
                      if (window.location.pathname === "/") {
                        setTimeout(() => {
                          document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/about" className="navA">About</Link>
          <Link to="/contact" className="navA">Contact</Link>

          {user?.isAdmin && <Link to="/admin" className="navA">Admin</Link>}
        </nav>

        <div className="headerRight">
          <div className="searchPill" role="search">
            <input
              className="searchInput headerSearch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              onKeyDown={(e) => e.key === "Enter" && goSearch()}
            />
            <button className="searchBtn" type="button" onClick={goSearch}>
              Search
            </button>
          </div>

          <Link to="/checkout" className="cartBtn" aria-label="Cart">
            Cart
            <span className="cartCount">{cartCount}</span>
          </Link>

          {!user ? (
            <Link to="/login" className="ghostBtn">Login</Link>
          ) : (
            <>
              {user.isAdmin && (
                <button className="adminHeaderBtn" onClick={() => nav("/admin")} type="button">Admin</button>
              )}
              <div className="userPill">
                <span className="muted">Hi,</span> <b>{user.name}</b>
                <button className="linkBtn" onClick={logout} type="button">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
