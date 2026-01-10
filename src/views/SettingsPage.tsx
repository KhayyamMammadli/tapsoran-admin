import React from "react";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { useAuth } from "../state/AuthContext";

export function SettingsPage() {
  const { user } = useAuth();

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

      <Alert severity="info">
        Tam admin CRUD üçün backend-ə əlavə endpoint-lər lazımdır (məs: /admin/users, /admin/categories).
        İstəsən, backend-i də admin üçün genişləndirib sənə ayrı ZIP kimi verim.
      </Alert>
    </Box>
  );
}
