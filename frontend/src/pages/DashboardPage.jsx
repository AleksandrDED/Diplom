import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import KpiCard from "../components/ui/KpiCard.jsx";
import StatusChip from "../components/ui/StatusChip.jsx";
import { formatDateTime } from "../utils/format.js";

const KPI_CONFIG = [
  { key: "new", label: "Новые", accent: "#2563EB", accentBg: "#EBF5FF" },
  { key: "in_progress", label: "В работе", accent: "#2563EB", accentBg: "#DBEAFE" },
  { key: "waiting", label: "Ожидание", accent: "#0284C7", accentBg: "#E0F2FE" },
  { key: "done", label: "Завершено", accent: "#16A34A", accentBg: "#DCFCE7" }
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([
      api.get("/reports/summary").catch((e) => {
        throw new Error(e?.response?.data?.detail || "Нет доступа к сводке");
      }),
      api.get("/requests").catch(() => ({ data: [] }))
    ])
      .then(([sumRes, reqRes]) => {
        setSummary(sumRes.data);
        const sorted = [...reqRes.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecent(sorted.slice(0, 5));
      })
      .catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const map = {};
    (summary?.by_status || []).forEach((x) => {
      map[x.status] = x.count;
    });
    return map;
  }, [summary]);

  return (
    <>
      <PageHeader
        overline="СИСТЕМА УПРАВЛЕНИЯ ТСО"
        title="Панель управления"
        subtitle="Сводка по заявкам на техническое обслуживание"
      />

      {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}

      {summary ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {KPI_CONFIG.map((k) => (
            <Grid item xs={12} sm={6} md={3} key={k.key}>
              <KpiCard label={k.label} value={counts[k.key] ?? 0} accent={k.accent} accentBg={k.accentBg} />
            </Grid>
          ))}
        </Grid>
      ) : !error ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Загрузка…
        </Typography>
      ) : null}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Последние заявки
          </Typography>
          {recent.length === 0 ? (
            <Typography color="text.secondary">Заявок пока нет. Перейдите в раздел «Заявки».</Typography>
          ) : (
            <Stack spacing={1}>
              {recent.map((r) => (
                <Box
                  key={r.id}
                  component={Link}
                  to={`/requests/${r.id}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "#F8FAFC" }
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      #{r.id} — {r.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.protected_object?.name} · {formatDateTime(r.created_at)}
                    </Typography>
                  </Box>
                  <StatusChip status={r.status} />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </>
  );
}
