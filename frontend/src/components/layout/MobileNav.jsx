import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { NAV } from "./Sidebar.jsx";
import { colors } from "../../theme/index.js";

export default function MobileNav({ open, onClose }) {
  const location = useLocation();

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose} sx={{ display: { md: "none" } }}>
      <List sx={{ width: 260, pt: 2 }}>
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <ListItemButton
              key={to}
              component={Link}
              to={to}
              onClick={onClose}
              sx={{
                color: active ? colors.navy : "text.secondary",
                bgcolor: active ? "#EBF5FF" : "transparent"
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? colors.accent : "text.secondary" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
