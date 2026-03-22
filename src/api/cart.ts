import { apiFetch, apiJson, readStoredAuth } from "./client";
import type { CartItem, CartResponse } from "./types";

export function getCart(): Promise<CartResponse> {
  const userId = readStoredAuth()?.userId;
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  return apiJson<CartResponse>(`/api/cart${qs}`, { method: "GET", auth: true });
}

export function addToCart(item: {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}): Promise<CartResponse> {
  return apiJson<CartResponse>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(item),
    auth: true,
  });
}

export function updateCartLine(
  productId: string,
  quantity: number
): Promise<CartResponse> {
  return apiJson<CartResponse>(
    `/api/cart/items/${encodeURIComponent(productId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ quantity }),
      auth: true,
    }
  );
}

export function removeCartLine(productId: string): Promise<CartResponse> {
  return apiJson<CartResponse>(
    `/api/cart/items/${encodeURIComponent(productId)}`,
    { method: "DELETE", auth: true }
  );
}

export async function clearCart(): Promise<void> {
  const res = await apiFetch("/api/cart", { method: "DELETE", auth: true });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}
