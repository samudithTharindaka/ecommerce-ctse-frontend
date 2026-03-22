import type { ApiErrorBody } from "./types";

const STORAGE_KEY = "ecommerce_auth";

export function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (base && typeof base === "string") {
    return base.replace(/\/$/, "");
  }
  return "http://localhost:8080";
}

export type StoredAuth = {
  token: string;
  userId: string;
  username: string;
  email: string;
  roles: string[];
};

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth | null): void {
  if (!auth) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit & {
    auth?: boolean;
    /** If false, clear token on 401 but do not run global logout redirect */
    authSessionExpired?: boolean;
  } = {}
): Promise<Response> {
  const { auth = false, authSessionExpired = true, headers: initHeaders, ...rest } =
    init;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const stored = readStoredAuth();
    if (stored?.token) {
      headers.set("Authorization", `Bearer ${stored.token}`);
    }
  }
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...rest, headers });
  if (res.status === 401 && auth) {
    writeStoredAuth(null);
    if (authSessionExpired) onUnauthorized?.();
  }
  return res;
}

export async function apiJson<T>(
  path: string,
  init: RequestInit & {
    auth?: boolean;
    authSessionExpired?: boolean;
  } = {}
): Promise<T> {
  const res = await apiFetch(path, init);
  const body = (await parseBody(res)) as ApiErrorBody | T | undefined;
  if (!res.ok) {
    const msg =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as ApiErrorBody).message === "string"
        ? (body as ApiErrorBody).message!
        : res.statusText || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, body as ApiErrorBody);
  }
  return body as T;
}
