import React from "react";
import { Box, Typography } from "@mui/material";
import { getStatusMeta } from "../../utils/status.js";

export default function StatusChip({ status }) {
  const meta = getStatusMeta(status);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        bgcolor: meta.bg
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: meta.color }} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: meta.color, fontSize: "0.75rem" }}>
        {meta.label}
      </Typography>
    </Box>
  );
}
