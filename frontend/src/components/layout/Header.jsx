import React, { useEffect, useState } from "react";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import MobileNav from "./MobileNav.jsx";
import { api } from "../../api.js";
import UserAvatar from "../ui/UserAvatar.jsx";
import { colors } from "../../theme/index.js";

const ROLE_LABELS = {
  admin: "Администратор",
  manager: "Менеджер",
  engineer: "Инженер",
  requester: "Заявитель"
};

export default function Header() {
  const [me, setMe] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/users/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#fff",
        borderBottom: `1px solid ${colors.border}`,
        color: colors.navy
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
        <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: "none" }, color: colors.navy }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.navy }}>
          TCO Precision
        </Typography>
        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box sx={{ flexGrow: 1 }} />

        {me ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {me.full_name || me.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ROLE_LABELS[me.role] || me.role}
              </Typography>
            </Box>
            <UserAvatar email={me.email} />
            <Button size="small" onClick={logout} sx={{ color: "text.secondary", ml: 1 }}>
              Выйти
            </Button>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
