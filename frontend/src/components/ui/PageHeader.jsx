import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ overline, title, subtitle, actions }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} spacing={2} sx={{ mb: 3 }}>
      <Box>
        {overline ? (
          <Typography variant="overline" sx={{ display: "block", mb: 0.5 }}>
            {overline}
          </Typography>
        ) : null}
        <Typography variant="h4" sx={{ mb: subtitle ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box> : null}
    </Stack>
  );
}
