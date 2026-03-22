import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import * as ordersApi from "../api/orders";
import * as paymentsApi from "../api/payments";
import type { OrderResponse, PaymentResponse } from "../api/types";
import { formatDate, formatMoney } from "../lib/format";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const o = await ordersApi.getOrder(id);
        if (!cancelled) setOrder(o);
        try {
          const p = await paymentsApi.getPaymentByOrder(id);
          if (!cancelled) setPayment(p);
        } catch {
          if (!cancelled) setPayment(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Order not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <p className="banner error">{error || "Not found"}</p>
        <Link to="/orders">← Orders</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/orders" className="back-link">
        ← All orders
      </Link>
      <div className="card stack">
        <h1>Order {order.id}</h1>
        <p className="subtle">{formatDate(order.createdAt)}</p>
        <p>
          Status: <code>{order.status}</code> · Payment:{" "}
          <code>{order.paymentStatus}</code>
        </p>
        {order.paymentId && <p className="subtle">Payment id: {order.paymentId}</p>}
        <p>Ship to: {order.shippingAddress}</p>
        {order.notes && <p>Notes: {order.notes}</p>}
        <h2>Items</h2>
        <ul className="plain-list">
          {order.items.map((i) => (
            <li key={`${i.productId}-${i.quantity}`}>
              {i.productName} × {i.quantity} — {formatMoney(i.price * i.quantity)}
            </li>
          ))}
        </ul>
        <p className="total">
          Total: <strong>{formatMoney(order.totalAmount)}</strong>
        </p>
      </div>

      {payment && (
        <div className="card stack">
          <h2>Payment</h2>
          <p>
            {formatMoney(payment.amount)} via {payment.method} —{" "}
            <code>{payment.status}</code>
          </p>
          {payment.transactionId && (
            <p className="subtle">Txn: {payment.transactionId}</p>
          )}
          {payment.failureReason && (
            <p className="banner error">{payment.failureReason}</p>
          )}
        </div>
      )}
    </div>
  );
}
