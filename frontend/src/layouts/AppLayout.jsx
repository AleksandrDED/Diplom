import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH } from "../components/layout/Sidebar.jsx";
import Header from "../components/layout/Header.jsx";
import { colors } from "../theme/index.js";

export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.pageBg }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Header />
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
