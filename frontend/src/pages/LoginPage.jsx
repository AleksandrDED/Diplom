import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { colors } from "../theme/index.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      if (remember) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Ошибка входа");
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        maxWidth: 960,
        width: "100%",
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(11, 31, 58, 0.12)"
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
          p: 4,
          background: `linear-gradient(160deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          color: "#fff"
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
            <BuildOutlinedIcon />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
              TCO PRECISION
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", mb: 2, lineHeight: 1.3 }}>
            Управление обслуживанием ТСО
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.7 }}>
            Система учёта заявок на техническое обслуживание технических средств охраны объектов.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 3, pt: 4 }}>
          {[
            { val: "24/7", sub: "Доступ" },
            { val: "ISO", sub: "Стандарты" },
            { val: "TCO", sub: "Контроль" }
          ].map((item) => (
            <Box key={item.sub}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
                {item.val}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: "0.08em" }}>
                {item.sub}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: { xs: 3, sm: 5 }, bgcolor: "#fff" }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Добро пожаловать
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Введите учётные данные для доступа к панели управления
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em", mb: 0.75, display: "block" }}>
              ЭЛЕКТРОННАЯ ПОЧТА
            </Typography>
            <TextField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: "0.06em", mb: 0.75, display: "block" }}>
              ПАРОЛЬ
            </Typography>
            <TextField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <VisibilityOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <FormControlLabel
            control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Запомнить меня</Typography>}
          />

          <Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ py: 1.5, mt: 1 }}>
            Войти в систему
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
          Нет учётной записи? Свяжитесь с администратором
        </Typography>
      </Box>
    </Card>
  );
}
