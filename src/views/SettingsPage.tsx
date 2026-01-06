import React, { useEffect, useState } from "react";
import { Alert, Box, Card, CardContent, Divider, TextField, Typography, Button } from "@mui/material";
import { useAuth } from "../state/AuthContext";
import { api } from "../lib/api";

type LegalType = "PRIVACY" | "TERMS";

type LegalPage = {
  id: string;
  type: LegalType;
  title: string;
  content: string;
  updatedAt: string;
};

export function SettingsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [privacyTitle, setPrivacyTitle] = useState("Məxfilik Siyasəti");
  const [privacyContent, setPrivacyContent] = useState("");
  const [termsTitle, setTermsTitle] = useState("İstifadə Şərtləri");
  const [termsContent, setTermsContent] = useState("");

  const load = async () => {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        api.get<LegalPage>("/admin/legal/PRIVACY"),
        api.get<LegalPage>("/admin/legal/TERMS"),
      ]);

      if (p.data) {
        setPrivacyTitle(p.data.title || "Məxfilik Siyasəti");
        setPrivacyContent(p.data.content || "");
      }
      if (t.data) {
        setTermsTitle(t.data.title || "İstifadə Şərtləri");
        setTermsContent(t.data.content || "");
      }
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Yükləmə xətası");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (type: LegalType) => {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const title = type === "PRIVACY" ? privacyTitle : termsTitle;
      const content = type === "PRIVACY" ? privacyContent : termsContent;
      await api.put(`/admin/legal/${type}`, { title, content });
      setOk(type === "PRIVACY" ? "Məxfilik Siyasəti yadda saxlanıldı" : "İstifadə Şərtləri yadda saxlanıldı");
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Yadda saxlama xətası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Hesab
          </Typography>
          <Typography color="text.secondary">
            {user?.fullName} • {user?.email} • {user?.role}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Qaydalar & Məxfilik
          </Typography>
          <Typography color="text.secondary">
            Bu bölmədən Privacy Policy və İstifadə Şərtlərini yeniləyə bilərsiniz. Mobil tətbiq bunu real-time göstərir.
          </Typography>

          {err ? <Alert severity="error">{String(err)}</Alert> : null}
          {ok ? <Alert severity="success">{String(ok)}</Alert> : null}

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Məxfilik Siyasəti (Privacy Policy)
          </Typography>
          <TextField
            label="Başlıq"
            value={privacyTitle}
            onChange={(e) => setPrivacyTitle(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
          />
          <TextField
            label="Məzmun (HTML)"
            value={privacyContent}
            onChange={(e) => setPrivacyContent(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            disabled={loading}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => save("PRIVACY")} disabled={loading}>
              Yadda saxla
            </Button>
            <Button variant="outlined" onClick={load} disabled={loading}>
              Yenilə
            </Button>
          </Box>

          <Divider />

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            İstifadə Şərtləri (Terms & Conditions)
          </Typography>
          <TextField
            label="Başlıq"
            value={termsTitle}
            onChange={(e) => setTermsTitle(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
          />
          <TextField
            label="Məzmun (HTML)"
            value={termsContent}
            onChange={(e) => setTermsContent(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            disabled={loading}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => save("TERMS")} disabled={loading}>
              Yadda saxla
            </Button>
            <Button variant="outlined" onClick={load} disabled={loading}>
              Yenilə
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
