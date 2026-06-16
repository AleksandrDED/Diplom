const STATUS_MAP = {
  new: { label: "Новая", color: "#64748B", bg: "#F1F5F9" },
  assigned: { label: "Назначена", color: "#2563EB", bg: "#DBEAFE" },
  in_progress: { label: "В работе", color: "#2563EB", bg: "#DBEAFE" },
  waiting: { label: "Ожидание", color: "#0284C7", bg: "#E0F2FE" },
  done: { label: "Завершено", color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Отменена", color: "#94A3B8", bg: "#F1F5F9" }
};

export function getStatusMeta(status) {
  return STATUS_MAP[status] || { label: status, color: "#64748B", bg: "#F1F5F9" };
}
