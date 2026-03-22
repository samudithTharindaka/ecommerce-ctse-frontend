import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import * as ordersApi from "../api/orders";
import type { OrderResponse } from "../api/types";
import { formatDate, formatMoney } from "../lib/format";

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.listOrders({ page, size });
      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <h1>Your orders</h1>
      {error && <p className="banner error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && orders.length === 0 && (
        <p className="muted">No orders yet.</p>
      )}
      <ul className="order-list">
        {orders.map((o) => (
          <li key={o.id} className="card order-row">
            <div>
              <Link to={`/orders/${o.id}`}>
                <strong>Order {o.id}</strong>
              </Link>
              <p className="subtle">{formatDate(o.createdAt)}</p>
            </div>
            <div>
              <span className="pill">{o.status}</span>{" "}
              <span className="pill subtle">{o.paymentStatus}</span>
            </div>
            <div className="align-end">{formatMoney(o.totalAmount)}</div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn ghost"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            className="btn ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
