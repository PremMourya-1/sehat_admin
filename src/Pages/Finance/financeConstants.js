// Kept local to this folder rather than added to the shared
// src/Constant/Constant.js — the Finance mini-app (Expenses + Sales) is
// deliberately isolated from the rest of the admin panel (see
// FINANCE.md), so its own constants stay isolated too.

// localStorage keys — distinct from ADMIN_DETAILS so a finance login can
// never be confused with (or clobber) an admin session in the same browser.
export const FINANCE_TOKEN_KEY = "financeToken";
export const FINANCE_USER_KEY = "financeUser";

// Must match Expense.ALLOWED_ADDED_BY / Sale.ALLOWED_ADDED_BY on the
// backend (models/Expense.js, models/Sale.js) — both share this same list.
export const FINANCE_USERS = [
  { value: "shinu", label: "Shinu" },
  { value: "komal", label: "Komal" },
];

// Distinct badge color per person so "Added By" is readable at a glance in
// either list — badge-primary (forest green) / badge-secondary (maroon),
// both already defined in Styles/App.css, no new CSS needed.
export const ADDED_BY_BADGE_CLASS = {
  shinu: "badge-primary",
  komal: "badge-secondary",
};

export function addedByLabel(value) {
  return FINANCE_USERS.find((u) => u.value === value)?.label || value;
}
