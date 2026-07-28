// localStorage key used to persist the logged-in admin's session details.
export const ADMIN_DETAILS = "SEHAT_POTLI_ADMIN_DETAILS";

// Fixed set of selectable product tag/badge values (Sehat Potli domain rule).
export const PRODUCT_TAGS = [
  "100% Natural",
  "Rich in Nutrition",
  "Premium Quality",
  "Healthy Lifestyle",
];

// Fixed set of selectable product-variant weight options.
export const VARIANT_WEIGHTS = ["250g", "500g", "1kg"];

// Order status options (must match backend ENUM).
export const ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Fixed CMS page slugs (backend auto-seeds these, admin only edits).
export const CMS_PAGES = [
  { slug: "terms-and-conditions", label: "Terms & Conditions" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "refund-policy", label: "Refund Policy" },
];

export const BRAND_NAME = "Sehat Potli";
export const BRAND_TAGLINE = "Sehat Ki Potli, Har Ghar Ki Zaroorat";
