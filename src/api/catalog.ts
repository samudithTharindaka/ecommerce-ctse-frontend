import { ApiError, apiFetch, apiJson } from "./client";
import type {
  Product,
  ProductRequest,
  SpringPage,
  StockCheckResponse,
} from "./types";

export function listProducts(params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<SpringPage<Product>> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString();
  return apiJson<SpringPage<Product>>(
    `/api/catalog/products${qs ? `?${qs}` : ""}`
  );
}

export function getProduct(id: string): Promise<Product> {
  return apiJson<Product>(`/api/catalog/products/${encodeURIComponent(id)}`);
}

export function productsByCategory(
  category: string,
  params: { page?: number; size?: number; sort?: string }
): Promise<SpringPage<Product>> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString();
  return apiJson<SpringPage<Product>>(
    `/api/catalog/products/category/${encodeURIComponent(category)}${qs ? `?${qs}` : ""}`
  );
}

export function searchProducts(
  qText: string,
  params: { page?: number; size?: number }
): Promise<SpringPage<Product>> {
  const q = new URLSearchParams();
  q.set("q", qText);
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return apiJson<SpringPage<Product>>(
    `/api/catalog/products/search?${q.toString()}`
  );
}

export function stockCheck(
  productId: string,
  quantity: number
): Promise<StockCheckResponse> {
  return apiJson<StockCheckResponse>(
    `/api/catalog/products/${encodeURIComponent(productId)}/stock-check?quantity=${quantity}`
  );
}

export function createProduct(body: ProductRequest): Promise<Product> {
  return apiJson<Product>("/api/catalog/products", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
}

export function updateProduct(
  id: string,
  body: ProductRequest
): Promise<Product> {
  return apiJson<Product>(`/api/catalog/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
    auth: true,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(
    `/api/catalog/products/${encodeURIComponent(id)}`,
    { method: "DELETE", auth: true }
  );
  if (!res.ok) {
    let body: { message?: string } | undefined;
    try {
      body = (await res.json()) as { message?: string };
    } catch {
      /* empty */
    }
    throw new ApiError(
      body?.message || res.statusText || `HTTP ${res.status}`,
      res.status,
      body
    );
  }
}
