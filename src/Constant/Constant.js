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

// Customer-facing status (Order.customerStatus, separate from the
// operational `status` above — see models/Order.js). confirmed/dispatched
// are set by order creation/label generation; picked_up/in_transit/
// out_for_delivery/delivered/rto are driven by Shiprocket's status webhook
// (see utils/shiprocket.js handleShiprocketStatusWebhook).
export const CUSTOMER_STATUS_LABELS = {
  confirmed: "Order Confirmed",
  dispatched: "Dispatched",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "Returned to Origin",
  cancelled: "Cancelled",
};

// All Indian states + UTs — used for the shipping-zone state assignment
// checkboxes (see Pages/Settings/ShippingZones.jsx). Names must match what
// utils/pincodeResolver.js's India Post lookup returns (compared
// case-insensitively in utils/shippingZones.js, but keep spelling aligned).
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Fixed CMS page slugs (backend auto-seeds these, admin only edits).
export const CMS_PAGES = [
  { slug: "terms-and-conditions", label: "Terms & Conditions" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "refund-policy", label: "Refund Policy" },
];

export const BRAND_NAME = "Sehat Potli";
export const BRAND_TAGLINE = "Sehat Ki Potli, Har Ghar Ki Zaroorat";
