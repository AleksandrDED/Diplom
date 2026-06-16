import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatusChip from "../components/ui/StatusChip.jsx";
import UserAvatar from "../components/ui/UserAvatar.jsx";
import { formatDateTime } from "../utils/format.js";
import { getStatusMeta } from "../utils/status.js";

const STATUSES = ["", "new", "assigned", "in_progress", "waiting", "done", "cancelled"];

export default function RequestsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [objects, setObjects] = useState([]);
  const [types, setTypes] = useState([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterObject, setFilterObject] = useState("");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectId, setObjectId] = useState("");
  const [typeId, setTypeId] = useState("");

  const load = async () => {
    setError("");
    try {
      const [reqs, objs, tps] = await Promise.all([
        api.get("/requests"),
        api.get("/directories/objects"),
        api.get("/directories/equipment-types")
      ]);
      setRows(reqs.data);
      setObjects(objs.data);
      setTypes(tps.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка загрузки");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      setOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterObject && String(r.protected_object?.id) !== filterObject) return false;
      return true;
    });
  }, [rows, filterStatus, filterObject]);

  const create = async () => {
    setError("");
    try {
      await api.post("/requests", {
        title,
        description,
        object_id: Number(objectId),
        equipment_type_id: Number(typeId)
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setObjectId("");
      setTypeId("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка создания");
    }
  };

  return (
    <>
      <PageHeader
        title="Список заявок"
        subtitle="Управление заявками на техническое обслуживание ТСО"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Создать заявку
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField select label="Статус" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={{ minWidth: 180 }} size="small">
          <MenuItem value="">Все</MenuItem>
          {STATUSES.filter(Boolean).map((s) => (
            <MenuItem key={s} value={s}>
              {getStatusMeta(s).label}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Объект" value={filterObject} onChange={(e) => setFilterObject(e.target.value)} sx={{ minWidth: 220 }} size="small">
          <MenuItem value="">Все</MenuItem>
          {objects.map((o) => (
            <MenuItem key={o.id} value={String(o.id)}>
              {o.name}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <Card sx={{ px: 2.5, py: 1.5, bgcolor: "#0B1F3A", color: "#fff", border: "none", minWidth: 160 }}>
          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: "0.06em" }}>
            АКТИВНЫЕ
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
            {rows.filter((r) => !["done", "cancelled"].includes(r.status)).length}
          </Typography>
        </Card>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["№", "Статус", "Объект", "Тип ТСО", "Исполнитель", "Создана"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem", letterSpacing: "0.04em" }}>
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  hover
                  component={Link}
                  to={`/requests/${r.id}`}
                  sx={{ textDecoration: "none", cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>#{r.id}</TableCell>
                  <TableCell>
                    <StatusChip status={r.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.protected_object?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.protected_object?.address}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.equipment_type?.name}</TableCell>
                  <TableCell>
                    {r.assigned_to ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <UserAvatar email={r.assigned_to.email} size={28} />
                        <Typography variant="body2">{r.assigned_to.email}</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDateTime(r.created_at)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Заявки не найдены</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Новая заявка</DialogTitle>
        <DialogContent>
          {objects.length === 0 || types.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Сначала добавьте объекты и типы ТСО в разделе{" "}
              <Box
                component="span"
                onClick={() => {
                  setOpen(false);
                  navigate("/directories");
                }}
                sx={{ color: "primary.main", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                «Справочники»
              </Box>
              .
            </Alert>
          ) : null}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Тема" value={title} onChange={(e) => setTitle(e.target.value)} />
            <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} />
            <TextField
              select
              label="Объект"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              helperText={objects.length === 0 ? "Нет доступных объектов" : ""}
            >
              {objects.length === 0 ? (
                <MenuItem disabled value="">
                  Список пуст
                </MenuItem>
              ) : (
                objects.map((o) => (
                  <MenuItem key={o.id} value={String(o.id)}>
                    {o.name} — {o.address}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              select
              label="Тип ТСО"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              helperText={types.length === 0 ? "Нет доступных типов ТСО" : ""}
            >
              {types.length === 0 ? (
                <MenuItem disabled value="">
                  Список пуст
                </MenuItem>
              ) : (
                types.map((t) => (
                  <MenuItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button
            onClick={create}
            variant="contained"
            disabled={!title || !description || !objectId || !typeId || objects.length === 0 || types.length === 0}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
