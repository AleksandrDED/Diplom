import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export default function KpiCard({ label, value, accent = "#2563EB", accentBg = "#EBF5FF" }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline">{label}</Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main", my: 1 }}>
          {value}
        </Typography>
        <Box sx={{ height: 4, borderRadius: 2, bgcolor: accentBg, overflow: "hidden" }}>
          <Box sx={{ width: "60%", height: "100%", bgcolor: accent, borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
