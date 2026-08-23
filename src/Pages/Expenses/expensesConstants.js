// Kept local to this folder rather than added to the shared
// src/Constant/Constant.js — the Expenses Tracker is deliberately isolated
// from the rest of the admin panel (see EXPENSES.md), so its own constants
// stay isolated too.

// localStorage keys — distinct from ADMIN_DETAILS so an expenses login can
// never be confused with (or clobber) an admin session in the same browser.
export const EXPENSES_TOKEN_KEY = "expensesToken";
export const EXPENSES_USER_KEY = "expensesUser";

// Must match Expense.ALLOWED_ADDED_BY on the backend (models/Expense.js).
export const EXPENSE_USERS = [
  { value: "shinu", label: "Shinu" },
  { value: "komal", label: "Komal" },
];

// Distinct badge color per person so "Added By" is readable at a glance in
// the list — badge-primary (forest green) / badge-secondary (maroon), both
// already defined in Styles/App.css, no new CSS needed.
export const ADDED_BY_BADGE_CLASS = {
  shinu: "badge-primary",
  komal: "badge-secondary",
};

export function addedByLabel(value) {
  return EXPENSE_USERS.find((u) => u.value === value)?.label || value;
}
