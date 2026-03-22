const money = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
