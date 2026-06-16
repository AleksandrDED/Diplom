import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import StatusChip from "../components/ui/StatusChip.jsx";
import UserAvatar from "../components/ui/UserAvatar.jsx";
import { formatDate, formatDateTime } from "../utils/format.js";
import { colors } from "../theme/index.js";
import { getStatusMeta } from "../utils/status.js";

const STATUSES = ["new", "assigned", "in_progress", "waiting", "done", "cancelled"];

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("");

  const load = async () => {
    setError("");
    try {
      const [r, m] = await Promise.all([api.get(`/requests/${id}`), api.get("/users/me")]);
      setReq(r.data);
      setMe(m.data);
      setStatus(r.data.status);
      setAssignee(r.data?.assigned_to?.id ? String(r.data.assigned_to.id) : "");

      api
        .get("/users")
        .then((u) => setUsers(u.data))
        .catch(() => setUsers([]));
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка загрузки");
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const canManage = useMemo(() => ["admin", "manager", "engineer"].includes(me?.role), [me]);

  const comments = useMemo(() => {
    return (req?.events || [])
      .filter((e) => e.message && (e.event_type === "comment" || e.event_type === "status_change"))
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [req]);

  const doAssign = async () => {
    setError("");
    try {
      await api.patch(`/requests/${id}/assign`, { assigned_to_id: assignee ? Number(assignee) : null });
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка назначения");
    }
  };

  const doStatus = async () => {
    setError("");
    try {
      await api.patch(`/requests/${id}/status`, { status, comment: comment || null });
      setComment("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка смены статуса");
    }
  };

  const addComment = async () => {
    setError("");
    try {
      await api.post(`/requests/${id}/comments`, { message: comment });
      setComment("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка комментария");
    }
  };

  if (!req) return <Typography color="text.secondary">Загрузка…</Typography>;

  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>
        <Box component={Link} to="/requests" sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: colors.accent } }}>
          ЗАЯВКИ
        </Box>
        {" > "}
        ЗАЯВКА #{req.id}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, mt: 1 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Заявка #{req.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Создано {formatDate(req.created_at)}
            {req.assigned_to ? ` · Ответственный: ${req.assigned_to.email}` : ""}
          </Typography>
        </Box>
        <StatusChip status={req.status} />
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <WarningAmberOutlinedIcon sx={{ color: colors.accent, fontSize: 20 }} />
                <Typography variant="overline">Описание проблемы</Typography>
              </Stack>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {req.title}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", color: "text.secondary", lineHeight: 1.7 }}>
                {req.description}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="overline" sx={{ display: "block", mb: 2 }}>
                Информация об объекте
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em" }}>
                    ОБЪЕКТ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {req.protected_object?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em" }}>
                    АДРЕС
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {req.protected_object?.address}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em" }}>
                    ТИП ТСО
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {req.equipment_type?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em" }}>
                    СОЗДАЛ
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {req.created_by?.email}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 2, bgcolor: colors.navy, color: "#fff", border: "none" }}>
            <CardContent>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.6)", display: "block", mb: 2 }}>
                Действие
              </Typography>
              <TextField
                select
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={!canManage}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" },
                  "& .MuiSvgIcon-root": { color: "#fff" }
                }}
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {getStatusMeta(s).label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                fullWidth
                variant="contained"
                onClick={doStatus}
                disabled={!canManage || !status}
                sx={{ bgcolor: "#fff", color: colors.navy, "&:hover": { bgcolor: "#EBF5FF" }, mb: 2 }}
              >
                Обновить статус
              </Button>

              <TextField
                select
                fullWidth
                label="Исполнитель"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                disabled={!canManage || users.length === 0}
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.1)", color: "#fff" },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiSvgIcon-root": { color: "#fff" }
                }}
              >
                <MenuItem value="">— не назначен —</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={String(u.id)}>
                    {u.email}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                fullWidth
                variant="outlined"
                onClick={doAssign}
                disabled={!canManage}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", "&:hover": { borderColor: "#fff" } }}
              >
                Назначить
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Комментарии
              </Typography>
              <Stack spacing={1.5} sx={{ mb: 2, maxHeight: 320, overflow: "auto" }}>
                {comments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Комментариев пока нет
                  </Typography>
                ) : (
                  comments.map((e) => (
                    <Box key={e.id} sx={{ display: "flex", gap: 1.5 }}>
                      <UserAvatar email={e.actor?.email} size={32} />
                      <Box sx={{ flex: 1, bgcolor: "#F8FAFC", borderRadius: 2, p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {e.actor?.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(e.created_at)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2">
                          {e.message}
                          {e.from_status || e.to_status ? ` (${e.from_status || "—"} → ${e.to_status || "—"})` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Напишите сообщение…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button variant="contained" onClick={addComment} disabled={!comment}>
                  Отпр.
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
