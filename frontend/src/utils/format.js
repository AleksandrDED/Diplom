import dayjs from "dayjs";

export function formatDateTime(value) {
  if (!value) return "—";
  return dayjs(value).format("DD MMM YYYY, HH:mm");
}

export function formatDate(value) {
  if (!value) return "—";
  return dayjs(value).format("DD MMMM YYYY");
}

export function initials(email) {
  if (!email) return "?";
  const part = email.split("@")[0];
  return part.slice(0, 2).toUpperCase();
}
