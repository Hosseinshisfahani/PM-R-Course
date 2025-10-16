'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  Edit,
  Visibility,
  Download,
  Person,
} from '@mui/icons-material';
import {
  DataTable,
  SearchFilter,
  SelectFilter,
} from '@/components/Admin';
import { adminApi } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
  phone_number?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const hasFetchedUsers = useRef(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (userTypeFilter) params.user_type = userTypeFilter;

      const data = await adminApi.getUsers(params);
      // Ensure data is always an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: 'خطا در بارگذاری کاربران', severity: 'error' });
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm, userTypeFilter]);

  useEffect(() => {
    if (canAccessAdminFeatures && !hasFetchedUsers.current) {
      hasFetchedUsers.current = true;
      fetchUsers();
    }
  }, [canAccessAdminFeatures, fetchUsers]);

  // Handle search and filter changes
  useEffect(() => {
    if (canAccessAdminFeatures && hasFetchedUsers.current) {
      fetchUsers();
    }
  }, [searchTerm, userTypeFilter, fetchUsers, canAccessAdminFeatures]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    hasFetchedUsers.current = false; // Allow refetch for search
  };

  const handleUserTypeChange = (value: string | number | (string | number)[]) => {
    setUserTypeFilter(value as string);
    hasFetchedUsers.current = false; // Allow refetch for filter
  };

  const handleUserUpdate = async (userId: number, updates: Partial<User>) => {
    try {
      await adminApi.updateUser(userId, updates);
      setSnackbar({ open: true, message: 'کاربر با موفقیت به‌روزرسانی شد', severity: 'success' });
      hasFetchedUsers.current = false; // Allow refetch
      fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({ open: true, message: 'خطا در به‌روزرسانی کاربر', severity: 'error' });
    }
  };


  const handleRefresh = () => {
    hasFetchedUsers.current = false; // Allow refetch
    fetchUsers();
  };

  const exportToCSV = () => {
    // Implement CSV export
    console.log('Exporting users to CSV');
    setSnackbar({ open: true, message: 'فایل CSV آماده دانلود است', severity: 'success' });
  };

  const getUserTypeChip = (userType: string) => {
    if (!userType) {
      return <Chip color="default" label="نامشخص" size="small" />;
    }
    const chipProps = {
      admin: { color: 'error' as const, label: 'مدیر' },
      staff: { color: 'warning' as const, label: 'بازاریاب' },
      customer: { color: 'primary' as const, label: 'مشتری' },
    };
    const chip = chipProps[userType as keyof typeof chipProps] || { color: 'default' as const, label: 'نامشخص' };
    return <Chip color={chip.color} label={chip.label} size="small" />;
  };

  const getStatusChip = (isActive: boolean) => {
    if (isActive === undefined || isActive === null) {
      return <Chip color="default" label="نامشخص" size="small" />;
    }
    return isActive ? (
      <Chip color="success" label="فعال" size="small" />
    ) : (
      <Chip color="default" label="غیرفعال" size="small" />
    );
  };

  const columns = [
    {
      field: 'avatar',
      headerName: 'آواتار',
      width: 80,
      renderCell: (params: any) => (
        <Avatar sx={{ width: 32, height: 32 }}>
          {params?.row?.first_name?.[0] || params?.row?.username?.[0] || 'U'}
        </Avatar>
      ),
    },
    {
      field: 'username',
      headerName: 'نام کاربری',
      width: 150,
    },
    {
      field: 'full_name',
      headerName: 'نام کامل',
      width: 200,
      valueGetter: (params: any) => {
        if (!params?.row) return '';
        const firstName = params.row.first_name || '';
        const lastName = params.row.last_name || '';
        return `${firstName} ${lastName}`.trim();
      },
    },
    {
      field: 'email',
      headerName: 'ایمیل',
      width: 250,
    },
    {
      field: 'user_type',
      headerName: 'نوع کاربر',
      width: 120,
      renderCell: (params: any) => getUserTypeChip(params?.value || ''),
    },
    {
      field: 'is_active',
      headerName: 'وضعیت',
      width: 100,
      renderCell: (params: any) => getStatusChip(params?.value || false),
    },
    {
      field: 'created_at',
      headerName: 'تاریخ عضویت',
      width: 150,
      valueGetter: (params: any) => {
        if (!params?.value) return '';
        try {
          return new Date(params.value).toLocaleDateString('fa-IR');
        } catch (error) {
          return '';
        }
      },
    },
  ];

  if (!canAccessAdminFeatures) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h4" color="text.secondary">
          دسترسی غیرمجاز
        </Typography>
        <Typography variant="body1" color="text.secondary">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">مدیریت کاربران</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            به‌روزرسانی
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportToCSV}
          >
            خروجی CSV
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1.5fr 1fr' },
            gap: 2, 
            alignItems: 'center' 
          }}>
            <SearchFilter
              placeholder="جستجو در نام، ایمیل یا نام کاربری..."
              onSearch={handleSearch}
            />
            <SelectFilter
              label="نوع کاربر"
              options={[
                { value: '', label: 'همه' },
                { value: 'customer', label: 'مشتری' },
                { value: 'staff', label: 'بازاریاب' },
                { value: 'admin', label: 'مدیر' },
              ]}
              value={userTypeFilter}
              onChange={handleUserTypeChange}
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setUserTypeFilter('');
              }}
            >
              پاک کردن فیلترها
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        rows={users || []}
        columns={columns || []}
        loading={loading}
        onEdit={(id) => {
          const user = users.find(u => u.id === id);
          if (user) {
            setSelectedUser(user);
            setShowModal(true);
          }
        }}
        onView={(id) => {
          const user = users.find(u => u.id === id);
          if (user) {
            setSelectedUser(user);
            setShowModal(true);
          }
        }}
        exportFileName="users"
        title="لیست کاربران"
      />

      {/* User Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>ویرایش کاربر</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box component="form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget as HTMLFormElement);
              const updates = {
                user_type: formData.get('user_type') as string,
                is_active: formData.get('is_active') === 'true',
              };
              handleUserUpdate(selectedUser.id, updates);
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2, 
                mt: 1 
              }}>
                <TextField
                  fullWidth
                  label="نام کاربری"
                  value={selectedUser.username}
                  disabled
                />
                <TextField
                  fullWidth
                  label="ایمیل"
                  value={selectedUser.email}
                  disabled
                />
                <FormControl fullWidth>
                  <InputLabel>نوع کاربر</InputLabel>
                  <Select
                    name="user_type"
                    defaultValue={selectedUser.user_type}
                    label="نوع کاربر"
                  >
                    <MenuItem value="customer">مشتری</MenuItem>
                    <MenuItem value="staff">بازاریاب</MenuItem>
                    <MenuItem value="admin">مدیر</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    name="is_active"
                    defaultValue={selectedUser.is_active.toString()}
                    label="وضعیت"
                  >
                    <MenuItem value="true">فعال</MenuItem>
                    <MenuItem value="false">غیرفعال</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>انصراف</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedUser) {
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
          >
            ذخیره تغییرات
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
