import { apiJson } from "./client";
import type { AuthResponse, TokenValidationResponse } from "./types";

export async function register(body: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function login(body: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function validateToken(): Promise<TokenValidationResponse> {
  return apiJson<TokenValidationResponse>("/api/auth/validate", {
    method: "GET",
    auth: true,
    authSessionExpired: false,
  });
}
