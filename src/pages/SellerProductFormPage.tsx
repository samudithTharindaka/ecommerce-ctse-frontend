import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";

const empty = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

export function SellerProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p: Product = await catalog.getProduct(id);
        if (!cancelled) {
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            category: p.category,
            stock: String(p.stock),
          });
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Could not load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const price = Number.parseFloat(form.price);
    const stock = Number.parseInt(form.stock, 10);
    if (Number.isNaN(price) || price < 0) {
      setError("Invalid price");
      setSaving(false);
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      setError("Invalid stock");
      setSaving(false);
      return;
    }
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category.trim(),
      stock,
    };
    try {
      if (isEdit && id) {
        await catalog.updateProduct(id, body);
      } else {
        await catalog.createProduct(body);
      }
      navigate("/seller");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page narrow">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <Link to="/seller" className="back-link">
        ← Seller
      </Link>
      <div className="card stack">
        <h1>{isEdit ? "Edit product" : "New product"}</h1>
        <form onSubmit={(e) => void onSubmit(e)} className="stack">
          <label>
            <span className="label-text">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              maxLength={200}
            />
          </label>
          <label>
            <span className="label-text">Description</span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              maxLength={2000}
              rows={4}
            />
          </label>
          <label>
            <span className="label-text">Price (USD)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              required
            />
          </label>
          <label>
            <span className="label-text">Category</span>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              required
              maxLength={100}
            />
          </label>
          <label>
            <span className="label-text">Stock</span>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              required
            />
          </label>
          {error && <p className="banner error">{error}</p>}
          <div className="row">
            <Link to="/seller" className="btn ghost">
              Cancel
            </Link>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
