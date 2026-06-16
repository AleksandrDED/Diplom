import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { api } from "../api.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import UserAvatar from "../components/ui/UserAvatar.jsx";

const ROLES = ["admin", "manager", "engineer", "requester"];
const ROLE_LABELS = {
  admin: "Администратор",
  manager: "Менеджер",
  engineer: "Инженер",
  requester: "Заявитель"
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("requester");
  const [password, setPassword] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Нет доступа (нужна роль manager/admin)");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError("");
    try {
      await api.post("/users", { email, full_name: fullName || null, role, password });
      setOpen(false);
      setEmail("");
      setFullName("");
      setRole("requester");
      setPassword("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Ошибка создания пользователя (нужна роль admin)");
    }
  };

  return (
    <>
      <PageHeader
        title="Пользователи"
        subtitle="Управление учётными записями системы"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Создать
          </Button>
        }
      />

      {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Пользователь", "Email", "Роль"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.75rem" }}>
                    {h.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <UserAvatar email={u.email} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {u.full_name || "—"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{ROLE_LABELS[u.role] || u.role}</TableCell>
                </TableRow>
              ))}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Пользователи не найдены</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Новый пользователь</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="ФИО (опционально)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <TextField select label="Роль" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Минимум 8 символов"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={create} disabled={!email || !password || password.length < 8}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
