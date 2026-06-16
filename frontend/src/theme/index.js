import { createTheme } from "@mui/material";

const navy = "#0B1F3A";
const navyLight = "#132D4F";
const accent = "#2563EB";
const inputBg = "#EBF5FF";
const pageBg = "#F4F7FB";

export const colors = {
  navy,
  navyLight,
  accent,
  inputBg,
  pageBg,
  sidebarBg: "#FAFBFD",
  border: "#E2E8F0"
};

export default createTheme({
  palette: {
    mode: "light",
    primary: { main: navy, light: accent, dark: "#061425" },
    secondary: { main: accent },
    background: { default: pageBg, paper: "#FFFFFF" },
    text: { primary: "#1A2332", secondary: "#64748B" },
    divider: colors.border
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: navy },
    h5: { fontWeight: 700, color: navy },
    h6: { fontWeight: 600, color: navy },
    overline: { letterSpacing: "0.08em", fontWeight: 600, color: "#94A3B8" }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: pageBg }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          backgroundColor: navy,
          "&:hover": { backgroundColor: navyLight }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 3px rgba(11, 31, 58, 0.06)"
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: inputBg,
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "#BFDBFE" },
            "&.Mui-focused fieldset": { borderColor: accent }
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.sidebarBg
        }
      }
    }
  }
});
