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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>İstifadəçi</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Əməliyyat</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(q.data || []).map((u) => {
                const isSelf = u.id === auth.user?.id;
                const isSuperAdmin = u.role === "SUPER_ADMIN";
                const deleteDisabled = isSuperAdmin || isSelf || (delMut.isPending && delTarget?.id === u.id);

                return (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ minWidth: 220 }}>
                      <Typography sx={{ fontWeight: 800 }} noWrap>
                        {u.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {u.email}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip size="small" label={u.role} />
                    </TableCell>

                    <TableCell>{u.tip ? <Chip size="small" label={u.tip} /> : <Typography color="text.secondary">-</Typography>}</TableCell>

                    <TableCell sx={{ minWidth: 220 }}>
                      {u.blocked ? <Chip size="small" color="error" label="BLOCKED" /> : <Chip size="small" color="success" label="ACTIVE" />}
                      {u.blocked ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <b>Səbəb:</b> {u.blockedReason || "-"}
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell align="right" sx={{ minWidth: 220 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
                        {u.blocked ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => unblockMut.mutate(u.id)}
                            disabled={unblockMut.isPending}
                          >
                            Blokdan çıxar
                          </Button>
                        ) : (
                          <Button
                            size="small"
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
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={deleteDisabled}
                          onClick={() => {
                            setDelTarget(u);
                            setDelOpen(true);
                          }}
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
        </CardContent>
      </Card>

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
          <Button
            variant="contained"
            color="error"
            onClick={() => blockMut.mutate()}
            disabled={!reason.trim() || blockMut.isPending}
          >
            Blokla
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={delOpen} onClose={() => setDelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>İstifadəçini sil</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>Silinəcək istifadəçi:</Typography>
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
