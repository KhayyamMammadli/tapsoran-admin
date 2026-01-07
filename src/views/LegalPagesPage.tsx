import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../lib/api";

type LegalType = "PRIVACY" | "TERMS";

type LegalPage = {
  type: LegalType;
  title: string;
  content: string;
  updatedAt?: string;
};

export function LegalPagesPage() {
  const [tab, setTab] = React.useState<LegalType>("TERMS");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async (type: LegalType) => {
    setLoading(true);
    try {
      const { data } = await api.get<LegalPage>(`/admin/legal/${type}`);
      setTitle(data?.title || (type === "TERMS" ? "İstifadəçi qaydaları" : "Məxfilik siyasəti"));
      setContent(data?.content || "");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      await api.put(`/admin/legal/${tab}`, { title: title.trim(), content });
    } finally {
      setSaving(false);
    }
  }, [tab, title, content]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Qaydalar & Məxfilik
        </Typography>
        <Button
          variant="contained"
          onClick={() => void save()}
          disabled={saving || loading || content.trim().length < 10 || title.trim().length < 2}
        >
          {saving ? "Yadda saxlanır…" : "Yadda saxla"}
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab value="TERMS" label="İstifadəçi qaydaları" />
            <Tab value="PRIVACY" label="Məxfilik siyasəti" />
          </Tabs>

          <Stack gap={2}>
            <TextField
              label="Başlıq"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              helperText={title.trim().length < 2 ? "Başlıq ən azı 2 simvol olmalıdır" : ""}
            />
            <TextField
              label="Mətn (HTML də ola bilər)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              multiline
              minRows={14}
              placeholder="Buraya mətni yazın…"
            />
            <Typography variant="body2" color="text.secondary">
              Mobil tətbiq bu səhifələri buradan oxuyur: <b>/legal/TERMS</b> və <b>/legal/PRIVACY</b>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
