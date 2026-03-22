import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../lib/format";

export function SellerProductsPage() {
  const { user } = useAuth();
  const [mine, setMine] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await catalog.listProducts({ page: 0, size: 200, sort: "createdAt,desc" });
      const filtered = res.content.filter((p) => p.sellerId === user.userId);
      setMine(filtered);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load catalog");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!window.confirm("Soft-delete this product?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await catalog.deleteProduct(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header row spread">
        <div>
          <h1>Seller</h1>
          <p className="subtle">
            Create products and manage listings you own (first 200 catalog items
            scanned for your seller id).
          </p>
        </div>
        <Link to="/seller/new" className="btn primary">
          New product
        </Link>
      </div>
      {error && <p className="banner error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && mine.length === 0 && (
        <p className="muted">
          No products linked to your account yet.{" "}
          <Link to="/seller/new">Create one</Link>.
        </p>
      )}
      <ul className="plain-list seller-list">
        {mine.map((p) => (
          <li key={p.id} className="card order-row">
            <div>
              <strong>{p.name}</strong>
              <p className="subtle">{p.category}</p>
            </div>
            <div>{formatMoney(p.price)}</div>
            <div>Stock: {p.stock}</div>
            <div className="row tight">
              <Link
                to={`/seller/edit/${p.id}`}
                className="btn ghost small"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn ghost small danger"
                disabled={deletingId === p.id}
                onClick={() => void remove(p.id)}
              >
                {deletingId === p.id ? "…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
