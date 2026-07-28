import dayjs from "dayjs";
import { COMMON_IMAGE_URL } from "../Service/service";

/**
 * Formats a date value using dayjs.
 */
export const formatDate = (date, format = "DD MMM YYYY") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Formats a number as Indian Rupees currency.
 */
export const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

/**
 * Resolves a backend-relative image path (e.g. "/uploads/xxx.jpg")
 * into a fully-qualified URL using VITE_COMMON_IMAGE_URL.
 */
export const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${COMMON_IMAGE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/**
 * Truncates a plain-text or HTML string to a max length, appending an ellipsis.
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  const plain = String(text).replace(/<[^>]*>/g, "");
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}...`;
};

/**
 * Joins truthy class name fragments together (like classnames/clsx).
 */
export const cx = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Coerces mixed boolean-ish values ("1"/"true"/true/1) into a real boolean.
 */
export const toBool = (value) => value === true || value === "true" || value === 1 || value === "1";
