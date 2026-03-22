import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            Marketplace
          </Link>
          <nav className="main-nav">
            <NavLink to="/" end className={navClass}>
              Shop
            </NavLink>
            {user && (
              <>
                <NavLink to="/cart" className={navClass}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={navClass}>
                  Orders
                </NavLink>
                <NavLink to="/payments" className={navClass}>
                  Payments
                </NavLink>
                <NavLink to="/seller" className={navClass}>
                  Seller
                </NavLink>
              </>
            )}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <span className="user-pill" title={user.email}>
                  {user.username}
                </span>
                <button type="button" className="btn ghost" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          API: <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}</code>
        </p>
      </footer>
    </div>
  );
}
