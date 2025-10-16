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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPersianNumber } from '@/theme/adminTheme';

interface RevenueData {
  month: string;
  revenue: number;
  previousRevenue?: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  height?: number;
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'روند درآمد',
  height = 300,
  loading = false,
}) => {
  const theme = useTheme();

  const formatTooltipValue = (value: number) => {
    return `${formatPersianNumber(value)} تومان`;
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
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
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
                formatter={(value: number) => [formatTooltipValue(value), 'درآمد']}
                labelFormatter={(label) => `ماه: ${label}`}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  direction: 'rtl',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
