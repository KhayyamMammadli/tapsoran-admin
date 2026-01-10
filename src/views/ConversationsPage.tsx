import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { API_URL } from "../config";
import { Alert, Box, Card, CardContent, Grid, Typography, Chip, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function absUrl(maybeRelative?: string | null) {
  if (!maybeRelative) return null;
  if (maybeRelative.startsWith("http")) return maybeRelative;
  return `${API_URL}${maybeRelative}`;
}

function previewLastMessage(c: any) {
  const m = c.messages?.[0];
  if (!m) return null;
  const t = m.type || "TEXT";
  if (t === "TEXT") return m.text || "";
  if (t === "IMAGE") return "📷 Şəkil";
  if (t === "AUDIO") return "🎤 Səs mesajı";
  if (t === "SYSTEM") return m.text || "";
  return null;
}

async function getConversations() {
  const r = await api.get<any[]>("/admin/conversations");
  return r.data;
}

export function ConversationsPage() {
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["admin-convs"], queryFn: getConversations });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {q.error ? <Alert severity="error">Chatləri çəkmək olmadı</Alert> : null}

      <Grid container spacing={2}>
        {(q.data || []).map((c: any) => {
          const reqTitle = c.acceptedRequest?.request?.title;
          const img = absUrl(c.acceptedRequest?.request?.imageUrl || null);
          const lastMsg = previewLastMessage(c);

          return (
            <Grid item xs={12} md={6} lg={4} key={c.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography sx={{ fontWeight: 900 }} noWrap>
                    Chat
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip size="small" label={`A: ${c.userA?.fullName || c.userAId}`} />
                    <Chip size="small" label={`B: ${c.userB?.fullName || c.userBId}`} />
                  </Box>

                  {reqTitle ? (
                    <Typography sx={{ mt: 1 }}>
                      <b>Sorğu:</b> {reqTitle}
                    </Typography>
                  ) : null}

                  {img ? (
                    <Box
                      component="img"
                      src={img}
                      alt={reqTitle || "request"}
                      sx={{
                        width: "100%",
                        height: 170,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: "1px solid #E5E7EB",
                        mt: 1,
                      }}
                    />
                  ) : null}

                  {lastMsg ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                      Son mesaj: {lastMsg}
                    </Typography>
                  ) : null}

                  <Box sx={{ flex: 1 }} />
                  <Button variant="contained" onClick={() => nav(`/conversations/${c.id}`)}>
                    Bax
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
