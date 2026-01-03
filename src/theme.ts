import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0A56C2" },
    secondary: { main: "#FF7A00" },
    background: { default: "#F6F8FC", paper: "#FFFFFF" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
});
