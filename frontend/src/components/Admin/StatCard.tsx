'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { formatPersianNumber } from '@/theme/adminTheme';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
  onClick,
  loading = false,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp />;
    if (trend.value < 0) return <TrendingDown />;
    return <TrendingFlat />;
  };

  const getTrendColor = () => {
    if (!trend) return 'default';
    if (trend.value > 0) return 'success';
    if (trend.value < 0) return 'error';
    return 'default';
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      return formatPersianNumber(val);
    }
    return val;
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}.main`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              icon={getTrendIcon()}
              label={`${trend.value > 0 ? '+' : ''}${trend.value}%`}
              color={getTrendColor() as any}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
            minHeight: '2.5rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <Box
              sx={{
                width: '60%',
                height: '2.5rem',
                backgroundColor: 'grey.300',
                borderRadius: 1,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : (
            formatValue(value)
          )}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            {trend.label}
          </Typography>
        )}
      </CardContent>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
      )}
    </Card>
  );
};

export default StatCard;
