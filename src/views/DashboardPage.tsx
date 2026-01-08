import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Alert, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { useAuth } from "../state/AuthContext";

async function getStats() {
  const r = await api.get<{ users: number; categories: number; requests: number }>("/admin/stats");
  return r.data;
}

export function DashboardPage() {
  const { token } = useAuth();
  const q = useQuery({ queryKey: ["admin-stats"], queryFn: getStats, enabled: !!token });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {q.error ? <Alert severity="error">Statistikaları çəkmək olmadı</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">İstifadəçilər</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{q.data?.users ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">Kateqoriyalar</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{q.data?.categories ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card><CardContent>
            <Typography color="text.secondary">Sorğular</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{q.data?.requests ?? "—"}</Typography>
          </CardContent></Card>
        </Grid>
        {/* Chat is temporarily hidden */}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>Moderasiya</Typography>
          <Typography color="text.secondary">
            İstifadəçiləri blokla (səbəb ilə), kateqoriya CRUD, sorğulara nəzarət.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
