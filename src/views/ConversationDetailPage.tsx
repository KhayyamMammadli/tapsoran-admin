import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { API_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
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
  TextField,
  Typography,
} from "@mui/material";

function absUrl(maybeRelative?: string | null) {
  if (!maybeRelative) return null;
  if (maybeRelative.startsWith("http")) return maybeRelative;
  return `${API_URL}${maybeRelative}`;
}

async function getConv(id: string) {
  const r = await api.get(`/admin/conversations/${id}/messages`);
  return r.data as any;
}

export function ConversationDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin-conv", id], queryFn: () => getConv(id!) });

  const [blockOpen, setBlockOpen] = React.useState(false);
  const [blockUserId, setBlockUserId] = React.useState<string | null>(null);
  const [blockUserLabel, setBlockUserLabel] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");

  const blockMut = useMutation({
    mutationFn: async () => {
      const r = await api.patch(`/admin/users/${blockUserId}/block`, { reason: reason.trim() });
      return r.data;
    },
    onSuccess: async () => {
      setBlockOpen(false);
      setBlockUserId(null);
      setBlockUserLabel(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-conv", id] });
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
      await qc.invalidateQueries({ queryKey: ["admin-convs"] });
    },
  });

  if (q.isLoading) return <Typography>Yüklənir...</Typography>;
  if (q.error) return <Alert severity="error">Chat məlumatını çəkmək olmadı</Alert>;

  const conv = q.data;
  const a = conv.userA;
  const b = conv.userB;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button onClick={() => nav("/conversations")}>← Geri</Button>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            İştirakçılar
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
            <Chip label={`A: ${a.fullName}`} />
            <Chip label={`B: ${b.fullName}`} />
          </Stack>

          <Stack direction="row" gap={1} sx={{ mt: 2 }}>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setBlockUserId(a.id);
                setBlockUserLabel(a.fullName);
                setReason("");
                setBlockOpen(true);
              }}
            >
              {a.fullName} blokla
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                setBlockUserId(b.id);
                setBlockUserLabel(b.fullName);
                setReason("");
                setBlockOpen(true);
              }}
            >
              {b.fullName} blokla
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Mesajlar
          </Typography>

          <Stack gap={1}>
            {(conv.messages || []).map((m: any) => {
              const t = m.type || "TEXT";
              const media = absUrl(m.mediaUrl || null);

              return (
                <Box key={m.id} sx={{ p: 1.2, border: "1px solid #E5E7EB", borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 800 }}>{m.sender?.fullName || m.senderId}</Typography>

                  {t === "TEXT" || t === "SYSTEM" ? <Typography>{m.text || ""}</Typography> : null}

                  {t === "IMAGE" ? (
                    <Stack gap={1} sx={{ mt: 0.5 }}>
                      {m.text ? <Typography>{m.text}</Typography> : null}
                      {media ? (
                        <a href={media} target="_blank" rel="noreferrer">
                          <img src={media} alt="image" style={{ maxWidth: 280, borderRadius: 8 }} />
                        </a>
                      ) : (
                        <Typography color="text.secondary">(image missing)</Typography>
                      )}
                    </Stack>
                  ) : null}

                  {t === "AUDIO" ? (
                    <Stack gap={1} sx={{ mt: 0.5 }}>
                      {m.text ? <Typography>{m.text}</Typography> : null}
                      {media ? (
                        <audio controls src={media} />
                      ) : (
                        <Typography color="text.secondary">(audio missing)</Typography>
                      )}
                    </Stack>
                  ) : null}

                  <Typography variant="caption" color="text.secondary">
                    {new Date(m.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
            {!conv.messages?.length ? <Typography color="text.secondary">Mesaj yoxdur</Typography> : null}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>İstifadəçini blokla</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Bloklanacaq: <b>{blockUserLabel}</b>
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
            Səbəb user-ə mobil tətbiqdə bildiriş kimi gedəcək.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)}>Ləğv et</Button>
          <Button variant="contained" color="error" onClick={() => blockMut.mutate()} disabled={!reason.trim() || blockMut.isPending}>
            Blokla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
