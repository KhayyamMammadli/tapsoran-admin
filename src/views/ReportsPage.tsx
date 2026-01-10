import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { api } from "../lib/api";

type ComplaintRow = {
  id: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  reason: string;
  details?: string | null;
  createdAt: string;
  reporter: { id: string; fullName: string; email: string };
  targetUser: { id: string; fullName: string; email: string; reportCount: number; blocked: boolean };
  request?: { id: string; title: string } | null;
};

export function ReportsPage() {
  const [status, setStatus] = React.useState<string>("OPEN");
  const [rows, setRows] = React.useState<ComplaintRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [blockRow, setBlockRow] = React.useState<ComplaintRow | null>(null);
  const [blockReason, setBlockReason] = React.useState<string>("");
  const [blockUntil, setBlockUntil] = React.useState<string>("");
  const [blockBusy, setBlockBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ComplaintRow[]>(`/admin/complaints?status=${encodeURIComponent(status)}`);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const setReportStatus = async (id: string, s: "OPEN" | "RESOLVED" | "DISMISSED") => {
    await api.patch(`/admin/complaints/${id}/status`, { status: s });
    await load();
  };

  const openBlock = (row: ComplaintRow) => {
    setBlockRow(row);
    setBlockReason(`Şikayət: ${row.reason}`);
    // default: 7 days
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setBlockUntil(local);
    setBlockOpen(true);
  };

  const confirmBlock = async () => {
    if (!blockRow) return;
    setBlockBusy(true);
    try {
      const iso = blockUntil ? new Date(blockUntil).toISOString() : "";
      await api.post(`/admin/complaints/${blockRow.id}/block`, {
        reason: blockReason,
        blockedUntil: iso,
      });
      setBlockOpen(false);
      setBlockRow(null);
      await load();
    } finally {
      setBlockBusy(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Şikayətlər
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <Select size="small" value={status} onChange={(e) => setStatus(String(e.target.value))}>
            <MenuItem value="OPEN">OPEN</MenuItem>
            <MenuItem value="RESOLVED">RESOLVED</MenuItem>
            <MenuItem value="DISMISSED">DISMISSED</MenuItem>
            <MenuItem value="ALL">ALL</MenuItem>
          </Select>
          <Button variant="outlined" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Context</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Chip label={r.status} size="small" color={r.status === "OPEN" ? "warning" : r.status === "RESOLVED" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800 }}>{r.reporter?.fullName || "-"}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.reporter?.email || "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800 }}>{r.targetUser?.fullName || "-"}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.targetUser?.email || "-"}</Typography>
                    <Stack direction="row" gap={1} sx={{ mt: 0.5 }}>
                      <Chip label={`reports: ${r.targetUser?.reportCount ?? 0}`} size="small" />
                      {r.targetUser?.blocked ? <Chip label="blocked" size="small" color="error" /> : null}
                    </Stack>
                  </TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 280 }}>
                      {r.details || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 280 }} noWrap>
                      {r.request?.title ? `Sorğu: ${r.request.title}` : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                      {!r.targetUser?.blocked ? (
                        <Button size="small" color="error" variant="text" onClick={() => openBlock(r)}>
                          Block
                        </Button>
                      ) : null}
                      <Button size="small" variant="text" onClick={() => void setReportStatus(r.id, "RESOLVED")}>Resolve</Button>
                      <Button size="small" variant="text" onClick={() => void setReportStatus(r.id, "DISMISSED")}>Dismiss</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İstifadəçini blokla</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField
            label="Blok səbəbi (admin qeydi)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Blok tarixi (bitmə)"
            type="datetime-local"
            value={blockUntil}
            onChange={(e) => setBlockUntil(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="İstəsəniz boş buraxın (müddətsiz blok)."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)} disabled={blockBusy}>
            Cancel
          </Button>
          <Button onClick={confirmBlock} color="error" variant="contained" disabled={blockBusy || blockReason.trim().length < 3}>
            Block &amp; notify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
