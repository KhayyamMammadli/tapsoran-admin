import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Badge } from "@mui/material";
import { useAuth } from "../../state/AuthContext";
import { api } from "../../lib/api";
import type { NotificationRow } from "../../types";

const drawerWidth = 280;

const navItemsBase = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Kateqoriyalar", path: "/categories", icon: <CategoryIcon /> },
  { label: "İstifadəçilər", path: "/users", icon: <PeopleIcon /> },
  { label: "Sorğular (Feed)", path: "/feed", icon: <ListAltIcon /> },
  { label: "Chatlər", path: "/conversations", icon: <ChatIcon /> },
  { label: "Bildirişlər", path: "/notifications", icon: <NotificationsIcon /> },
  { label: "Ayarlar", path: "/settings", icon: <SettingsIcon /> },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const isSm = useMediaQuery("(max-width: 900px)");
  const [open, setOpen] = React.useState(!isSm);
  const [unreadAdminCount, setUnreadAdminCount] = React.useState(0);

  React.useEffect(() => setOpen(!isSm), [isSm]);

  const refreshUnread = React.useCallback(async () => {
    try {
      const { data } = await api.get<NotificationRow[]>("/notifications");
      const rows = Array.isArray(data) ? data : [];
      const unread = rows.filter((n) => n.type === "ADMIN_VULGAR" && !n.readAt).length;
      setUnreadAdminCount(unread);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, 20000);
    return () => clearInterval(t);
  }, [refreshUnread]);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2.2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
          TapSoran Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Axtar • Sorğu ver • Tap
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItemsBase.map((it) => (
          <ListItemButton
            key={it.path}
            selected={loc.pathname === it.path}
            onClick={() => {
              nav(it.path);
              if (isSm) setOpen(false);
            }}
            sx={{ borderRadius: 2, my: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {it.path === "/notifications" ? (
                <Badge color="warning" badgeContent={unreadAdminCount} invisible={unreadAdminCount === 0}>
                  {it.icon}
                </Badge>
              ) : (
                it.icon
              )}
            </ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {(user?.fullName || "U").slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {user?.fullName || "-"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email || "-"} • {user?.role || "-"}
          </Typography>
        </Box>
        <IconButton
          onClick={() => {
            logout();
            nav("/login");
          }}
          title="Çıxış"
        >
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid #E5E7EB" }}>
        <Toolbar>
          {isSm ? (
            <IconButton onClick={() => setOpen((v) => !v)} edge="start" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
            {navItemsBase.find((x) => x.path === loc.pathname)?.label || "Dashboard"}
          </Typography>
          <Box sx={{ flex: 1 }} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isSm ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", borderRight: "1px solid #E5E7EB" },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
