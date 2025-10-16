'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  People,
  School,
  TrendingUp,
  Support,
  Dashboard as DashboardIcon,
  Person,
  Handshake,
  Inventory,
} from '@mui/icons-material';
import {
  StatCard,
  RevenueChart,
  UserGrowthChart,
} from '@/components/Admin';
import { adminApi } from '@/lib/api';

interface DashboardStats {
  users: {
    total: number;
    new_this_month: number;
    by_type: {
      admin: number;
      marketer: number;
      customer: number;
    };
  };
  courses: {
    total: number;
    published: number;
    packages_total: number;
    packages_published: number;
  };
  financial: {
    total_revenue: number;
    this_month_revenue: number;
    pending_commissions: number;
  };
  tickets: {
    total: number;
    open: number;
    in_progress: number;
    closed: number;
  };
  recent_activity: {
    purchases: any[];
    tickets: any[];
  };
  monthly_data: {
    month: string;
    revenue: number;
    users: number;
  }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchDashboardData();
    }
  }, [canAccessAdminFeatures]);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await adminApi.getDashboardStats();
      setStats(statsResponse);
      
      // Use real data from API for charts
      if (statsResponse.monthly_data) {
        setRevenueData(statsResponse.monthly_data.map((item: { month: string; revenue: number; users: number }) => ({
          month: item.month,
          revenue: item.revenue
        })));
        
        setUserGrowthData(statsResponse.monthly_data.map((item: { month: string; revenue: number; users: number }) => ({
          month: item.month,
          users: item.users
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          داشبورد مدیریت
        </Typography>
        <Typography variant="body1" color="text.secondary">
          خوش آمدید، {user?.first_name || user?.username}
        </Typography>
      </Box>

      {/* Top Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <StatCard
          title="کل کاربران"
          value={stats?.users.total || 0}
          icon={<People />}
          color="primary"
          trend={stats?.users.new_this_month ? {
            value: Math.round((stats.users.new_this_month / stats.users.total) * 100),
            label: `${stats.users.new_this_month} کاربر جدید این ماه`
          } : undefined}
          loading={loading}
        />
        <StatCard
          title="دوره‌های منتشر شده"
          value={stats?.courses.published || 0}
          icon={<School />}
          color="success"
          subtitle={`از ${stats?.courses.total || 0} دوره کل`}
          loading={loading}
        />
        <StatCard
          title="کل درآمد"
          value={`${stats?.financial.total_revenue?.toLocaleString() || 0} تومان`}
          icon={<TrendingUp />}
          color="warning"
          subtitle={`${stats?.financial.this_month_revenue?.toLocaleString() || 0} تومان این ماه`}
          loading={loading}
        />
        <StatCard
          title="تیکت‌های باز"
          value={stats?.tickets.open || 0}
          icon={<Support />}
          color="error"
          subtitle={`از ${stats?.tickets.total || 0} تیکت کل`}
          loading={loading}
        />
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <RevenueChart
          data={revenueData}
          title="روند درآمد ۶ ماهه"
          loading={loading}
        />
        <UserGrowthChart
          data={userGrowthData}
          title="رشد کاربران ماهانه"
          loading={loading}
        />
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            عملیات سریع
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2 
          }}>
            <Button
              component={Link}
              href="/admin/users"
              variant="outlined"
              fullWidth
              startIcon={<People />}
              sx={{ height: 56 }}
            >
              مدیریت کاربران
            </Button>
            <Button
              component={Link}
              href="/admin/courses"
              variant="outlined"
              fullWidth
              startIcon={<School />}
              sx={{ height: 56 }}
            >
              مدیریت دوره‌ها
            </Button>
            <Button
              component={Link}
              href="/admin/tickets"
              variant="outlined"
              fullWidth
              startIcon={<Support />}
              sx={{ height: 56 }}
            >
              تیکت‌های پشتیبانی
            </Button>
            <Button
              component={Link}
              href="/admin/finances"
              variant="outlined"
              fullWidth
              startIcon={<TrendingUp />}
              sx={{ height: 56 }}
            >
              گزارشات مالی
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              آمار کاربران
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 2, 
              textAlign: 'center' 
            }}>
              <Box borderRight={1} borderColor="divider" py={1}>
                <Typography variant="h4" color="primary">
                  {loading ? <Skeleton width={60} /> : stats?.users.by_type.customer || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  مشتری
                </Typography>
              </Box>
              <Box borderRight={1} borderColor="divider" py={1}>
                <Typography variant="h4" color="warning.main">
                  {loading ? <Skeleton width={60} /> : stats?.users.by_type.marketer || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  بازاریاب
                </Typography>
              </Box>
              <Box py={1}>
                <Typography variant="h4" color="error.main">
                  {loading ? <Skeleton width={60} /> : stats?.users.by_type.admin || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  مدیر
                </Typography>
              </Box>
            </Box>
            <Box mt={2} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {loading ? <Skeleton width={120} /> : `${stats?.users.new_this_month || 0} کاربر جدید این ماه`}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              آمار تیکت‌ها
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 2, 
              textAlign: 'center' 
            }}>
              <Box borderRight={1} borderColor="divider" py={1}>
                <Typography variant="h4" color="error.main">
                  {loading ? <Skeleton width={60} /> : stats?.tickets.open || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  باز
                </Typography>
              </Box>
              <Box borderRight={1} borderColor="divider" py={1}>
                <Typography variant="h4" color="warning.main">
                  {loading ? <Skeleton width={60} /> : stats?.tickets.in_progress || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  در حال بررسی
                </Typography>
              </Box>
              <Box py={1}>
                <Typography variant="h4" color="success.main">
                  {loading ? <Skeleton width={60} /> : stats?.tickets.closed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  بسته شده
                </Typography>
              </Box>
            </Box>
            <Box mt={2} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {loading ? <Skeleton width={100} /> : `کل تیکت‌ها: ${stats?.tickets.total || 0}`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Financial Overview */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            خلاصه مالی
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3, 
            textAlign: 'center' 
          }}>
            <Box>
              <Typography variant="h4" color="success.main">
                {loading ? <Skeleton width={120} /> : `${stats?.financial.total_revenue?.toLocaleString() || 0} تومان`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                کل درآمد
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="primary.main">
                {loading ? <Skeleton width={120} /> : `${stats?.financial.this_month_revenue?.toLocaleString() || 0} تومان`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                درآمد این ماه
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="warning.main">
                {loading ? <Skeleton width={120} /> : `${stats?.financial.pending_commissions?.toLocaleString() || 0} تومان`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                کمیسیون‌های در انتظار
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
