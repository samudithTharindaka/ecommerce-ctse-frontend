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
      <h1>Your cart</h1>
      {error && <p className="banner error">{error}</p>}

      {empty ? (
        <p className="muted">
          Your cart is empty. <Link to="/">Continue shopping</Link>
        </p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Line total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <tr key={line.productId}>
                  <td>{line.productName}</td>
                  <td>{formatMoney(line.price)}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
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
                  <td>
                    <button
                      type="button"
                      className="btn ghost small"
                      disabled={busyId === line.productId}
                      onClick={() => void removeLine(line.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-footer">
            <p className="total">
              Total ({cart?.itemCount ?? 0} items):{" "}
              <strong>{formatMoney(cart?.totalAmount ?? 0)}</strong>
            </p>
            <div className="row">
              <button
                type="button"
                className="btn ghost"
                disabled={busyId === "__all__"}
                onClick={() => void clear()}
              >
                Clear cart
              </button>
              <Link to="/checkout" className="btn primary">
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
