import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { User } from "../types";
import { useAuth } from "../state/AuthContext";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

async function getUsers() {
  const r = await api.get<User[]>("/admin/users");
  return r.data;
}

export function UsersPage() {
  const auth = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-users"], queryFn: getUsers });

  const [blockOpen, setBlockOpen] = React.useState(false);
  const [target, setTarget] = React.useState<User | null>(null);
  const [reason, setReason] = React.useState("");

  const blockMut = useMutation({
    mutationFn: async () => {
      const r = await api.patch(`/admin/users/${target!.id}/block`, { reason: reason.trim() });
      return r.data;
    },
    onSuccess: async () => {
      setBlockOpen(false);
      setTarget(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const unblockMut = useMutation({
    mutationFn: async (id: string) => {
      const r = await api.patch(`/admin/users/${id}/unblock`);
      return r.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<User | null>(null);

  const delMut = useMutation({
    mutationFn: async () => {
      const r = await api.delete(`/admin/users/${delTarget!.id}`);
      return r.data;
    },
    onSuccess: async () => {
      setDelOpen(false);
      setDelTarget(null);
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      await qc.invalidateQueries({ queryKey: ["admin-convs"] });
      await qc.invalidateQueries({ queryKey: ["feed"] });
      await qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {q.error ? <Alert severity="error">İstifadəçiləri çəkmək olmadı</Alert> : null}

      <Grid container spacing={2}>
        {(q.data || []).map((u) => (
          <Grid item xs={12} md={6} lg={4} key={u.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography sx={{ fontWeight: 900 }} noWrap>
                  {u.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {u.email}
                </Typography>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip size="small" label={u.role} />
                  {u.tip ? <Chip size="small" label={u.tip} /> : null}
                  {u.blocked ? <Chip size="small" color="error" label="BLOCKED" /> : <Chip size="small" color="success" label="ACTIVE" />}
                </Stack>

                {u.blocked ? (
                  <Typography variant="body2" color="text.secondary">
                    <b>Səbəb:</b> {u.blockedReason || "-"}
                  </Typography>
                ) : null}

                <Box sx={{ flex: 1 }} />

                <Stack direction="row" gap={1}>
                  {u.blocked ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => unblockMut.mutate(u.id)}
                      disabled={unblockMut.isPending}
                    >
                      Blokdan çıxar
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setTarget(u);
                        setReason("");
                        setBlockOpen(true);
                      }}
                    >
                      Blokla
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    disabled={
                      u.role === "SUPER_ADMIN" ||
                      u.id === auth.user?.id ||
                      (delMut.isPending && delTarget?.id === u.id)
                    }
                    onClick={() => {
                      setDelTarget(u);
                      setDelOpen(true);
                    }}
                  >
                    Sil
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>İstifadəçini blokla</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            <b>{target?.fullName}</b> ({target?.email})
          </Typography>
          <TextField
            autoFocus
            label="Blok səbəbi"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu səbəb user-ə mobil tətbiqdə bildiriş kimi gedəcək.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)}>Ləğv et</Button>
          <Button variant="contained" color="error" onClick={() => blockMut.mutate()} disabled={!reason.trim() || blockMut.isPending}>
            Blokla
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={delOpen} onClose={() => setDelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>İstifadəçini sil</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Silinəcək istifadəçi:
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <b>{delTarget?.fullName}</b> ({delTarget?.email})
          </Typography>
          <Alert severity="warning" sx={{ mt: 1 }}>
            Bu əməliyyat geri qaytarılmır. İstifadəçinin sorğuları, chat-ləri, mesajları və bildirişləri də silinəcək.
          </Alert>
          {delMut.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              Silmək alınmadı
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelOpen(false)}>Ləğv et</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => delMut.mutate()}
            disabled={!delTarget || delMut.isPending || delTarget?.role === "SUPER_ADMIN" || delTarget?.id === auth.user?.id}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
