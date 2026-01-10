import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { RequestRow } from "../types";
import { API_URL } from "../config";
import {
  Alert,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

async function getFeed() {
  const r = await api.get<RequestRow[]>("/admin/requests");
  return r.data;
}

export function RequestsFeedPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["feed"], queryFn: getFeed });

  const delOne = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/requests/${id}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const delAll = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/requests`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const rows = q.data || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={1}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Sorğular
        </Typography>
        <Stack direction="row" gap={1} justifyContent="flex-end" flexWrap="wrap">
          <Button variant="outlined" onClick={() => q.refetch()} disabled={q.isFetching}>
            Yenilə
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!confirm("Bütün sorğuları silmək istəyirsiniz?")) return;
              delAll.mutate();
            }}
            disabled={delAll.isPending}
          >
            Hamısını sil
          </Button>
        </Stack>
      </Stack>

      {q.error ? (
        <Alert severity="warning">
          Sorğuları çəkmək olmadı. Bu endpoint yalnız SUPER_ADMIN rolu ilə işləyir:{" "}
          <b>GET /admin/requests</b>
        </Alert>
      ) : null}

      {rows.length === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>Hazırda sorğu yoxdur.</Typography>
          <Typography variant="body2" color="text.secondary">
            Yeni sorğu gələndə burada siyahıda görəcəksiniz.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Tarix</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Başlıq</TableCell>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Scope</TableCell>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Kateqoriya</TableCell>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Alıcı</TableCell>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Şəkil</TableCell>
                <TableCell sx={{ fontWeight: 900, whiteSpace: "nowrap" }} align="right">
                  Əməliyyat
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => {
                const img = r.imageUrl
                  ? r.imageUrl.startsWith("http")
                    ? r.imageUrl
                    : `${API_URL}${r.imageUrl}`
                  : null;

                return (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell sx={{ minWidth: 220 }}>
                      <Typography sx={{ fontWeight: 800 }} noWrap title={r.title}>
                        {r.title}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip size="small" label={r.scope || "—"} />
                    </TableCell>

                    <TableCell>
                      {r.category?.name ? <Chip size="small" label={r.category.name} /> : "—"}
                    </TableCell>

                    <TableCell sx={{ minWidth: 180 }}>
                      {r.buyer?.fullName ? (
                        <Typography noWrap title={r.buyer.fullName}>
                          {r.buyer.fullName}
                        </Typography>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell sx={{ width: 110 }}>
                      {img ? (
                        <Box
                          component="img"
                          src={img}
                          alt={r.title}
                          sx={{
                            width: 96,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            border: "1px solid #E5E7EB",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigator.clipboard.writeText(r.id)}
                        >
                          ID kopyala
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            if (!confirm("Bu sorğunu silmək istəyirsiniz?")) return;
                            delOne.mutate(r.id);
                          }}
                          disabled={delOne.isPending}
                        >
                          Sil
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
