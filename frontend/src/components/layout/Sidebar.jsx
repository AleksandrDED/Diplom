import React from "react";
import {
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../theme/index.js";

const WIDTH = 260;

export const NAV = [
  { to: "/", label: "Дашборд", icon: DashboardOutlinedIcon },
  { to: "/requests", label: "Заявки", icon: AssignmentOutlinedIcon },
  { to: "/directories", label: "Справочники", icon: FolderOutlinedIcon },
  { to: "/users", label: "Пользователи", icon: PeopleOutlinedIcon }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2 }}>
      <Box sx={{ px: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: colors.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <BuildOutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.navy, lineHeight: 1.2 }}>
            TCO Precision
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", letterSpacing: "0.06em" }}>
            ЗАЯВКИ ТО ТСО
          </Typography>
        </Box>
      </Box>

      <List sx={{ px: 1.5, flex: 1 }}>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <ListItemButton
              key={to}
              component={Link}
              to={to}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                position: "relative",
                color: active ? colors.navy : "text.secondary",
                bgcolor: active ? "#EBF5FF" : "transparent",
                fontWeight: active ? 600 : 400,
                "&:hover": { bgcolor: active ? "#EBF5FF" : "#F1F5F9" },
                "&::after": active
                  ? {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 2,
                      bgcolor: colors.accent
                    }
                  : {}
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? colors.accent : "text.secondary" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: active ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/requests", { state: { openCreate: true } })}
          sx={{ py: 1.25, borderRadius: 2 }}
        >
          Новая заявка
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: WIDTH, boxSizing: "border-box" }
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export const SIDEBAR_WIDTH = WIDTH;
