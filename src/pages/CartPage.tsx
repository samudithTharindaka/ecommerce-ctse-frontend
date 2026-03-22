import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as cartApi from "../api/cart";
import { ApiError } from "../api/client";
import type { CartResponse } from "../api/types";
import { formatMoney } from "../lib/format";

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await cartApi.getCart();
      setCart(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function setQuantity(productId: string, quantity: number) {
    setBusyId(productId);
    setError(null);
    try {
      const c = await cartApi.updateCartLine(productId, quantity);
      setCart(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function removeLine(productId: string) {
    setBusyId(productId);
    setError(null);
    try {
      const c = await cartApi.removeCartLine(productId);
      setCart(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  async function clear() {
    setBusyId("__all__");
    setError(null);
    try {
      await cartApi.clearCart();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading && !cart) {
    return (
      <div className="page">
        <p className="muted">Loading cart…</p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const empty = items.length === 0;

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Cart</span>
      </div>

      {error && <p className="banner error">{error}</p>}

      {empty ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <h2>Your cart is empty</h2>
          <p className="muted" style={{ marginBottom: "2rem" }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn primary">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <tr key={line.productId}>
                  <td>
                    <div className="cart-item-info">
                      <span 
                        className="cart-item-remove" 
                        onClick={() => void removeLine(line.productId)}
                        title="Remove item"
                      >
                        ✕
                      </span>
                      <img 
                        src={`https://picsum.photos/seed/${line.productId}/60/60`} 
                        alt={line.productName}
                        className="cart-item-image"
                      />
                      <span>{line.productName}</span>
                    </div>
                  </td>
                  <td>{formatMoney(line.price)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      key={`${line.productId}-${line.quantity}`}
                      defaultValue={line.quantity}
                      disabled={busyId === line.productId}
                      onBlur={(e) => {
                        const n = Number.parseInt(e.target.value, 10);
                        if (Number.isNaN(n) || n === line.quantity) return;
                        void setQuantity(line.productId, n);
                      }}
                      className="qty-input"
                    />
                  </td>
                  <td>{formatMoney(line.price * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-actions">
            <Link to="/" className="btn ghost">Return To Shop</Link>
            <button
              type="button"
              className="btn ghost"
              disabled={busyId === "__all__"}
              onClick={() => void clear()}
            >
              Clear Cart
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
            {/* Coupon Section */}
            <div className="coupon-section">
              <input type="text" placeholder="Coupon Code" style={{ flex: 1 }} />
              <button className="btn primary">Apply Coupon</button>
            </div>

            {/* Cart Total */}
            <div className="cart-summary">
              <h3>Cart Total</h3>
              <div className="cart-summary-row">
                <span>Subtotal:</span>
                <span>{formatMoney(cart?.totalAmount ?? 0)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="cart-summary-row">
                <span><strong>Total:</strong></span>
                <span><strong>{formatMoney(cart?.totalAmount ?? 0)}</strong></span>
              </div>
              <Link to="/checkout" className="btn primary full-width" style={{ marginTop: "1rem" }}>
                Proceed to checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
