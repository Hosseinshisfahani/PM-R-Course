'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPersianNumber } from '@/theme/adminTheme';

interface UserGrowthData {
  month: string;
  users: number;
  previousUsers?: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
  title?: string;
  height?: number;
  loading?: boolean;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  title = 'رشد کاربران',
  height = 300,
  loading = false,
}) => {
  const theme = useTheme();

  const formatTooltipValue = (value: number) => {
    return `${formatPersianNumber(value)} کاربر`;
  };

  const formatXAxisLabel = (tickItem: string) => {
    return tickItem;
  };

  if (loading) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: height + 100 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="month" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickFormatter={(value) => formatPersianNumber(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatTooltipValue(value), 'کاربران']}
                labelFormatter={(label) => `ماه: ${label}`}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  direction: 'rtl',
                }}
              />
              <Bar
                dataKey="users"
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserGrowthChart;
