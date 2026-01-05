import React from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { api } from "../lib/api";
import type { NotificationRow } from "../types";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function NotificationsPage() {
  const [rows, setRows] = React.useState<NotificationRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"ALL" | "ADMIN_VULGAR">("ADMIN_VULGAR");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<NotificationRow[]>("/notifications");
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (tab === "ADMIN_VULGAR") return rows.filter((x) => x.type === "ADMIN_VULGAR");
    return rows;
  }, [rows, tab]);

  const unreadCount = React.useMemo(() => filtered.filter((x) => !x.readAt).length, [filtered]);

  async function markAllRead() {
    setBusy(true);
    try {
      if (tab === "ADMIN_VULGAR") {
        await api.post("/notifications/read-type", { type: "ADMIN_VULGAR" });
      } else {
        await api.post("/notifications/read-all");
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}>
            Bildirişlər
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vulqar söz istifadəsi və digər sistem bildirişləri.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.2} alignItems="center">
          {unreadCount > 0 ? (
            <Chip
              icon={<WarningAmberIcon />}
              label={`${unreadCount} oxunmamış`}
              color="warning"
              variant="outlined"
            />
          ) : (
            <Chip label="Hamısı oxunub" variant="outlined" />
          )}

          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            disabled={busy || loading || filtered.length === 0}
            onClick={markAllRead}
          >
            Oxunmuş et
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab value="ADMIN_VULGAR" label="Vulqar" />
          <Tab value="ALL" label="Hamısı" />
        </Tabs>
      </Box>

      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>Bildiriş yoxdur</Typography>
          <Typography variant="body2" color="text.secondary">
            Hələ heç bir bildiriş yaradılmayıb.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1.2}>
          {filtered.map((n) => (
            <Card
              key={n.id}
              sx={{
                p: 2,
                border: n.readAt ? "1px solid #E5E7EB" : "1px solid rgba(245, 124, 0, 0.55)",
                bgcolor: n.readAt ? "background.paper" : "rgba(245, 124, 0, 0.06)",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  {n.type === "ADMIN_VULGAR" ? <WarningAmberIcon color="warning" /> : null}
                  <Typography sx={{ fontWeight: 900 }} noWrap>
                    {n.title}
                  </Typography>
                  {n.type ? <Chip size="small" label={n.type} variant="outlined" /> : null}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {fmt(n.createdAt)}
                </Typography>
              </Stack>

              <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{n.body}</Typography>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
