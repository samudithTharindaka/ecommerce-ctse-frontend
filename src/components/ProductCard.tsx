import { Link } from "react-router-dom";
import type { Product } from "../api/types";
import { formatMoney } from "../lib/format";

interface ProductCardProps {
  product: Product;
  showDiscount?: boolean;
}

export function ProductCard({ product, showDiscount }: ProductCardProps) {
  const discount = showDiscount ? Math.floor(Math.random() * 30) + 10 : 0;
  const originalPrice = discount > 0 ? product.price / (1 - discount / 100) : product.price;

  return (
    <article className="product-card">
      <div className="product-card-image">
        {discount > 0 && (
          <span className="product-discount">-{discount}%</span>
        )}
        <div className="product-actions">
          <button className="product-action-btn" title="Add to Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button className="product-action-btn" title="Quick View">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <img 
          src={`https://picsum.photos/seed/${product.id}/200/200`} 
          alt={product.name}
          style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
        />
        <Link to={`/products/${product.id}`} className="add-to-cart-overlay">
          Add To Cart
        </Link>
      </div>
      
      <Link to={`/products/${product.id}`} className="product-card-link">
        <h3>{product.name}</h3>
        <div className="product-price-row">
          <p className="price">{formatMoney(product.price)}</p>
          {discount > 0 && (
            <span className="price-original">{formatMoney(originalPrice)}</span>
          )}
        </div>
        <div className="product-rating">
          <span className="stars">★★★★★</span>
          <span className="rating-count">({Math.floor(Math.random() * 100) + 10})</span>
        </div>
      </Link>
    </article>
  );
}
