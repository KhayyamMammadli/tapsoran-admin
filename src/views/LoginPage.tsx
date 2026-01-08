import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../state/AuthContext";
import { API_URL } from "../config";

export function LoginPage() {
  const { token, login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = React.useState("admin@tapsoran.az");
  const [password, setPassword] = React.useState("Admin12345!");
  const [showPassword, setShowPassword] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token) nav("/", { replace: true });
  }, [token, nav]);

  const submit = async () => {
    setErr(null);
    try {
      await login(email.trim(), password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Xəta baş verdi");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}>
      <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 4 }}>
        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            TapSoran Admin
          </Typography>
          <Typography color="text.secondary">
            Server: <b>{API_URL}</b>
          </Typography>

          {err ? <Alert severity="error">{err}</Alert> : null}

          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <TextField
            label="Şifrə"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" size="large" onClick={submit} disabled={!email || !password || loading}>
            Daxil ol
          </Button>

          <Box sx={{ mt: 1, pt: 2, borderTop: "1px solid #E5E7EB" }}>
  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
    Server: <b>http://localhost:4000</b>
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
    Super Admin: <b>superadmin@tapsoran.az</b> • Şifrə: <b>TapSoran@12345</b>
  </Typography>
</Box>
        </CardContent>
      </Card>
    </Box>
  );
}
