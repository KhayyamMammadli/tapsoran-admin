import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category } from "../types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

async function getCategories() {
  const r = await api.get<Category[]>("/admin/categories");
  return r.data;
}

export function CategoriesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-cats"], queryFn: getCategories });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [name, setName] = React.useState("");
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState<Category | null>(null);

  const createMut = useMutation({
    mutationFn: async () => {
      const r = await api.post("/admin/categories", { name: name.trim() });
      return r.data as Category;
    },
    onSuccess: async () => {
      setCreateOpen(false);
      setName("");
      await qc.invalidateQueries({ queryKey: ["admin-cats"] });
    },
  });

  const editMut = useMutation({
    mutationFn: async () => {
      const r = await api.put(`/admin/categories/${editing!.id}`, { name: name.trim() });
      return r.data as Category;
    },
    onSuccess: async () => {
      setEditOpen(false);
      setEditing(null);
      setName("");
      await qc.invalidateQueries({ queryKey: ["admin-cats"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/categories/${deleting!.id}`);
    },
    onSuccess: async () => {
      setDeleteOpen(false);
      setDeleting(null);
      await qc.invalidateQueries({ queryKey: ["admin-cats"] });
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {q.error ? <Alert severity="error">Kateqoriyaları çəkmək olmadı</Alert> : null}

      <Card>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Kateqoriyalar
            </Typography>
            <Typography color="text.secondary">Əlavə et • Dəyiş • Sil</Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setName(""); setCreateOpen(true); }}>
            Yeni kateqoriya
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack gap={1}>
            {(q.data || []).map((c) => (
              <Box
                key={c.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.2,
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.id}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => {
                      setEditing(c);
                      setName(c.name);
                      setEditOpen(true);
                    }}
                    title="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setDeleting(c);
                      setDeleteOpen(true);
                    }}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            {!q.data?.length ? <Typography color="text.secondary">—</Typography> : null}
          </Stack>
        </CardContent>
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni kateqoriya</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Ad"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Ləğv et</Button>
          <Button
            variant="contained"
            onClick={() => createMut.mutate()}
            disabled={!name.trim() || createMut.isPending}
          >
            Yarat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Kateqoriyanı dəyiş</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Ad"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Ləğv et</Button>
          <Button
            variant="contained"
            onClick={() => editMut.mutate()}
            disabled={!name.trim() || editMut.isPending}
          >
            Saxla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Silinsin?</DialogTitle>
        <DialogContent>
          <Typography>
            <b>{deleting?.name}</b> kateqoriyasını silmək istəyirsən?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Qeyd: Bu kateqoriyaya bağlı user/request varsa, server error qaytara bilər.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Ləğv et</Button>
          <Button color="error" variant="contained" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
