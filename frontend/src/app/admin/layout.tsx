'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Handshake,
  TrendingUp,
  School,
  Inventory,
  Support,
  Home,
  Person,
  Logout,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const { toggleMode } = useAdminTheme();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && !canAccessAdminFeatures) {
      window.location.href = '/';
    }
  }, [user, canAccessAdminFeatures]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  if (!user || !canAccessAdminFeatures) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h4" color="text.secondary">
          دسترسی غیرمجاز
        </Typography>
        <Typography variant="body1" color="text.secondary">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </Typography>
        <Button component={Link} href="/" variant="contained">
          بازگشت به صفحه اصلی
        </Button>
      </Box>
    );
  }

  const menuItems = [
    { href: '/admin', label: 'داشبورد', icon: <Dashboard /> },
    { href: '/admin/users', label: 'مدیریت کاربران', icon: <People /> },
    { href: '/admin/marketers', label: 'باشگاه بازاریابان', icon: <Handshake /> },
    { href: '/admin/finances', label: 'مدیریت مالی', icon: <TrendingUp /> },
    { href: '/admin/courses', label: 'مدیریت دوره‌ها', icon: <School /> },
    { href: '/admin/packages', label: 'مدیریت پکیج‌ها', icon: <Inventory /> },
    { href: '/admin/tickets', label: 'تیکت‌های پشتیبانی', icon: <Support /> },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'داشبورد', href: '/admin' }];
    
    if (pathSegments.length > 1) {
      const currentPage = menuItems.find(item => item.href === pathname);
      if (currentPage) {
        breadcrumbs.push({ label: currentPage.label, href: pathname });
      }
    }
    
    return breadcrumbs;
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          پنل مدیریت
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: pathname === item.href ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          right: { lg: 0 },
          left: { lg: 'auto' },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
            {getBreadcrumbs().map((breadcrumb, index) => (
              <Button
                key={index}
                component={Link}
                href={breadcrumb.href}
                color="inherit"
                sx={{ textDecoration: 'none' }}
              >
                {breadcrumb.label}
              </Button>
            ))}
          </Breadcrumbs>

          <Button
            component={Link}
            href="/"
            startIcon={<Home />}
            sx={{ mr: 2, color: 'white' }}
          >
            بازگشت به سایت
          </Button>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.first_name?.[0] || user.username?.[0] || 'A'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { lg: drawerWidth }, 
          flexShrink: { lg: 0 },
          order: { lg: 2 }, // Move drawer to the right in RTL
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          order: { lg: 1 }, // Move main content to the left in RTL
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Avatar /> پروفایل
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          خروج
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
