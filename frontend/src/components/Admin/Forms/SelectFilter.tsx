'use client';

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
} from '@mui/material';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFilterProps {
  label: string;
  options: SelectOption[];
  value: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  multiple?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  clearable?: boolean;
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  fullWidth = true,
  size = 'small',
  disabled = false,
  clearable = true,
}) => {
  const handleChange = (event: any) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  const handleClear = () => {
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
  };

  const renderValue = (selected: any) => {
    if (multiple) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value: string | number) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Chip
                key={value}
                label={option?.label || value}
                size="small"
                onDelete={clearable ? () => {
                  const newValue = selected.filter((v: any) => v !== value);
                  onChange(newValue);
                } : undefined}
              />
            );
          })}
        </Box>
      );
    } else {
      const option = options.find(opt => opt.value === selected);
      return option?.label || '';
    }
  };

  return (
    <Box sx={{ minWidth: 150 }}>
      <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          renderValue={renderValue}
          multiple={multiple}
          displayEmpty
        >
          {clearable && (
            <MenuItem value={multiple ? [] : ''}>
              <em>همه</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectFilter;
