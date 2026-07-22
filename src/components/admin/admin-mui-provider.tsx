"use client";

import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2577f4",
      dark: "#1c5fd4",
      light: "#eaf2ff"
    },
    secondary: {
      main: "#1d2435"
    },
    background: {
      default: "#f4f7fb",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b"
    },
    divider: "#dbe3ef"
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif"
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained"
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 999
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid #dbe3ef",
          boxShadow: "0 10px 35px rgba(15, 23, 42, 0.06)"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        fullWidth: true
      }
    }
  }
});

export function AdminMuiProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
