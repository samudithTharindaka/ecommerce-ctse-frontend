import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as cartApi from "../api/cart";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { formatMoney } from "../lib/format";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [stockOk, setStockOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setActionError(null);
      try {
        const p = await catalog.getProduct(id);
        if (!cancelled) setProduct(p);
      } catch (e) {
        if (!cancelled) {
          setActionError(
            e instanceof ApiError ? e.message : "Product not found"
          );
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !product) return;
    let cancelled = false;
    (async () => {
      try {
        const sc = await catalog.stockCheck(id, qty);
        if (!cancelled) setStockOk(sc.available);
      } catch {
        if (!cancelled) setStockOk(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, product, qty]);

  async function addToCart() {
    if (!user || !product) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    setActionError(null);
    try {
      await cartApi.addToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
      });
      navigate("/cart");
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <p className="banner error">{actionError || "Not found"}</p>
        <Link to="/">← Back to shop</Link>
      </div>
    );
  }

  const maxQty = Math.max(1, product.stock);

  return (
    <div className="page product-detail">
      <Link to="/" className="back-link">
        ← All products
      </Link>
      <article className="card detail-card">
        <h1>{product.name}</h1>
        <p className="subtle">
          {product.category}
          {product.sellerName && ` · Sold by ${product.sellerName}`}
        </p>
        <p className="price large">{formatMoney(product.price)}</p>
        <p className="description">{product.description}</p>
        <p className="subtle">{product.stock} in stock</p>

        {stockOk === false && (
          <p className="banner warn">
            Requested quantity may not be available.
          </p>
        )}

        <div className="detail-actions">
          <label>
            <span className="label-text">Quantity</span>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.min(
                    maxQty,
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1)
                  )
                )
              }
            />
          </label>
          <button
            type="button"
            className="btn primary"
            onClick={() => void addToCart()}
            disabled={adding || product.stock < 1}
          >
            {user ? (adding ? "Adding…" : "Add to cart") : "Log in to add to cart"}
          </button>
        </div>
        {actionError && <p className="banner error">{actionError}</p>}
      </article>
    </div>
  );
}
