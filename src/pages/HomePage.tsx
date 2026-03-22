import { useCallback, useEffect, useState } from "react";
import * as catalog from "../api/catalog";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import { ProductCard } from "../components/ProductCard";

type Mode = "all" | "search" | "category";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [searchQ, setSearchQ] = useState("");
  const [categoryQ, setCategoryQ] = useState("");
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "search") {
        if (!searchQ.trim()) {
          setProducts([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        const res = await catalog.searchProducts(searchQ.trim(), {
          page,
          size: pageSize,
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } else if (mode === "category") {
        if (!categoryQ.trim()) {
          setProducts([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
        const res = await catalog.productsByCategory(categoryQ.trim(), {
          page,
          size: pageSize,
          sort: "name,asc",
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      } else {
        const res = await catalog.listProducts({
          page,
          size: pageSize,
          sort: "name,asc",
        });
        setProducts(res.content);
        setTotalPages(res.totalPages);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [mode, page, searchQ, categoryQ]);

  useEffect(() => {
    void load();
  }, [load]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setMode("search");
  }

  function applyCategory(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setMode("category");
  }

  function showAll() {
    setMode("all");
    setPage(0);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Products</h1>
        <p className="subtle">
          Browse the catalog (public). Sign in to add items to your cart.
        </p>
      </header>

      <div className="toolbar card">
        <form onSubmit={applySearch} className="toolbar-row">
          <label>
            <span className="label-text">Search</span>
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search products…"
            />
          </label>
          <button type="submit" className="btn primary">
            Search
          </button>
        </form>
        <form onSubmit={applyCategory} className="toolbar-row">
          <label>
            <span className="label-text">Category</span>
            <input
              value={categoryQ}
              onChange={(e) => setCategoryQ(e.target.value)}
              placeholder="e.g. Electronics"
            />
          </label>
          <button type="submit" className="btn secondary">
            Filter
          </button>
          <button type="button" className="btn ghost" onClick={showAll}>
            Show all
          </button>
        </form>
      </div>

      {error && <p className="banner error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && !error && products.length === 0 && (
        <p className="muted">No products found.</p>
      )}

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn ghost"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
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
