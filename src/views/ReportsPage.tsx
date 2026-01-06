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
} from "@mui/material";
import { api } from "../lib/api";

type ReportRow = {
  id: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  reason: string;
  createdAt: string;
  reporter: { id: string; fullName: string; email: string };
  reportedUser: { id: string; fullName: string; email: string; reportCount: number; blocked: boolean };
  message: { id: string; text?: string | null; createdAt: string };
  conversation: { id: string };
};

export function ReportsPage() {
  const [status, setStatus] = React.useState<string>("OPEN");
  const [rows, setRows] = React.useState<ReportRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ReportRow[]>(`/admin/reports?status=${encodeURIComponent(status)}`);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const setReportStatus = async (id: string, s: "OPEN" | "RESOLVED" | "DISMISSED") => {
    await api.patch(`/admin/reports/${id}/status`, { status: s });
    await load();
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
                <TableCell>Message</TableCell>
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
                    <Typography sx={{ fontWeight: 800 }}>{r.reportedUser?.fullName || "-"}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.reportedUser?.email || "-"}</Typography>
                    <Stack direction="row" gap={1} sx={{ mt: 0.5 }}>
                      <Chip label={`reports: ${r.reportedUser?.reportCount ?? 0}`} size="small" />
                      {r.reportedUser?.blocked ? <Chip label="blocked" size="small" color="error" /> : null}
                    </Stack>
                  </TableCell>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 320 }} noWrap>
                      {r.message?.text || "(media)"}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={1} justifyContent="flex-end">
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
    </Box>
  );
}
