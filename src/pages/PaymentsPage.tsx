import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import * as paymentsApi from "../api/payments";
import type { PaymentResponse } from "../api/types";
import { formatDate, formatMoney } from "../lib/format";

export function PaymentsPage() {
  const [rows, setRows] = useState<PaymentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const size = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.paymentHistory({ page, size });
      setRows(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <h1>Payment history</h1>
      {error && <p className="banner error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && rows.length === 0 && (
        <p className="muted">No payments yet.</p>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Order</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{formatDate(p.createdAt)}</td>
              <td>
                <Link to={`/orders/${p.orderId}`}>{p.orderId}</Link>
              </td>
              <td>{formatMoney(p.amount)}</td>
              <td>{p.method}</td>
              <td>
                <code>{p.status}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
