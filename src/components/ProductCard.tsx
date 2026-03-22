import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { formatMoney } from "../lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <h3>{product.name}</h3>
        <p className="product-meta">
          {product.category}
          {product.sellerName && (
            <span className="seller"> · {product.sellerName}</span>
          )}
        </p>
        <p className="price">{formatMoney(product.price)}</p>
        <p className="stock subtle">
          {product.stock} in stock
          {product.active === false && " · inactive"}
        </p>
      </Link>
    </article>
  );
}
