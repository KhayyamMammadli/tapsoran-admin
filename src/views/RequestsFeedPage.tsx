import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { RequestRow } from "../types";
import { API_URL } from "../config";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
} from "@mui/material";

async function getFeed() {
  const r = await api.get<RequestRow[]>("/admin/requests");
  return r.data;
}

export function RequestsFeedPage() {
  const q = useQuery({ queryKey: ["feed"], queryFn: getFeed });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {q.error ? (
        <Alert severity="warning">
          Sorğuları çəkmək olmadı. Bu endpoint yalnız SUPER_ADMIN rolu ilə işləyir: <b>GET /requests/feed</b>
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        {(q.data || []).map((r) => {
          const img = r.imageUrl ? (r.imageUrl.startsWith("http") ? r.imageUrl : `${API_URL}${r.imageUrl}`) : null;
          return (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography sx={{ fontWeight: 800 }} noWrap>
                    {r.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(r.createdAt).toLocaleString()}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" label={r.scope} />
                    {r.category?.name ? <Chip size="small" label={r.category.name} /> : null}
                    {r.buyer?.fullName ? <Chip size="small" label={`Buyer: ${r.buyer.fullName}`} /> : null}
                  </Box>

                  {img ? (
                    <Box
                      component="img"
                      src={img}
                      alt={r.title}
                      sx={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                        mt: 1,
                      }}
                    />
                  ) : null}

                  <Box sx={{ flex: 1 }} />
                  <Button
                    variant="outlined"
                    onClick={() => navigator.clipboard.writeText(r.id)}
                  >
                    Request ID-ni kopyala
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        {!q.data?.length ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">Hazırda sorğu yoxdur.</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
