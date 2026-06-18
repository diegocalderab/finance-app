const API_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),

  categories: () => request("/categories"),
  createCategory: (payload) => request("/categories", { method: "POST", body: payload }),

  transactions: (month, year) => request(`/transactions?month=${month}&year=${year}`),
  summary: (month, year) => request(`/transactions/summary?month=${month}&year=${year}`),
  trend: (months = 6) => request(`/transactions/trend?months=${months}`),
  balance: () => request("/transactions/balance"),
  transactionMonths: () => request("/transactions/months"),
  createTransaction: (payload) => request("/transactions", { method: "POST", body: payload }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),

  goals: () => request("/goals"),
  goal: (id) => request(`/goals/${id}`),
  createGoal: (payload) => request("/goals", { method: "POST", body: payload }),
  contribute: (id, payload) => request(`/goals/${id}/contributions`, { method: "POST", body: payload }),

  investments: () => request("/investments"),
  createInvestment: (payload) => request("/investments", { method: "POST", body: payload }),
};
