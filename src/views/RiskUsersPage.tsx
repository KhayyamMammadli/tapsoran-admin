import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { api } from "../lib/api";

type RiskUser = {
  id: string;
  role: string;
  fullName: string;
  email: string;
  blocked: boolean;
  blockedReason?: string | null;
  blockedAt?: string | null;
  reportCount: number;
  moderationStrikes: number;
  chatFrozenUntil?: string | null;
  createdAt: string;
};

export function RiskUsersPage() {
  const [rows, setRows] = React.useState<RiskUser[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [freezeOpen, setFreezeOpen] = React.useState(false);
  const [freezeUser, setFreezeUser] = React.useState<RiskUser | null>(null);
  const [hours, setHours] = React.useState(24);
  const [reason, setReason] = React.useState("Təhlükəsizlik yoxlaması");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<RiskUser[]>("/admin/risk-users");
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      [r.fullName, r.email, r.role].some((x) => String(x || "").toLowerCase().includes(t))
    );
  }, [rows, q]);

  const freeze = React.useCallback(async () => {
    if (!freezeUser) return;
    await api.patch(`/admin/users/${freezeUser.id}/freeze`, { hours: Number(hours), reason });
    setFreezeOpen(false);
    setFreezeUser(null);
    void load();
  }, [freezeUser, hours, reason, load]);

  const unfreeze = React.useCallback(async (id: string) => {
    await api.patch(`/admin/users/${id}/unfreeze`, {});
    void load();
  }, [load]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Təhlükəsizlik Risk İstifadəçiləri
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <TextField size="small" placeholder="Axtar..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="contained" onClick={() => void load()} disabled={loading}>
            Yenilə
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>İstifadəçi</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Şikayət</TableCell>
                <TableCell align="right">Strikes</TableCell>
                <TableCell>Chat Status</TableCell>
                <TableCell>Hesab</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const frozen = r.chatFrozenUntil ? new Date(r.chatFrozenUntil).getTime() > Date.now() : false;
                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }}>{r.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">{r.email}</Typography>
                    </TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell align="right"><Chip label={r.reportCount} size="small" /></TableCell>
                    <TableCell align="right"><Chip label={r.moderationStrikes} size="small" color={r.moderationStrikes >= 2 ? "warning" : "default"} /></TableCell>
                    <TableCell>
                      {frozen ? (
                        <Chip label={`Frozen until ${new Date(r.chatFrozenUntil as string).toLocaleString()}`} size="small" color="warning" />
                      ) : (
                        <Chip label="OK" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      {r.blocked ? <Chip label="Blocked" size="small" color="error" /> : <Chip label="Active" size="small" color="success" />}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setFreezeUser(r);
                            setFreezeOpen(true);
                          }}
                          disabled={r.blocked}
                        >
                          Freeze
                        </Button>
                        <Button size="small" variant="text" onClick={() => void unfreeze(r.id)} disabled={!frozen}>
                          Unfreeze
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

      <Dialog open={freezeOpen} onClose={() => setFreezeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Çat Freeze</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ mt: 1 }}>
            <TextField label="Saat" type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            <TextField label="Səbəb" value={reason} onChange={(e) => setReason(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFreezeOpen(false)}>Ləğv et</Button>
          <Button variant="contained" onClick={() => void freeze()}>Freeze</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
