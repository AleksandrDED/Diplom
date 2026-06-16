import React from "react";
import { Avatar } from "@mui/material";
import { initials } from "../../utils/format.js";

export default function UserAvatar({ email, size = 32 }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        bgcolor: "#0B1F3A",
        fontWeight: 600
      }}
    >
      {initials(email)}
    </Avatar>
  );
}
