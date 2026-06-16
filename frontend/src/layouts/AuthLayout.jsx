import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { colors } from "../theme/index.js";

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${colors.pageBg} 0%, #E8F0FE 100%)`,
        p: 2
      }}
    >
      <Outlet />
    </Box>
  );
}
