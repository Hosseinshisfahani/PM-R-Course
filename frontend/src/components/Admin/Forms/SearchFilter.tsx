'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import {
  Search,
  Clear,
} from '@mui/icons-material';

interface SearchFilterProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = 'جستجو...',
  onSearch,
  debounceMs = 500,
  fullWidth = true,
  size = 'small',
  disabled = false,
}) => {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch, debounceMs]);

  const handleClear = () => {
    setSearchValue('');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 200 }}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        value={searchValue}
        onChange={handleSearchChange}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
    </Box>
  );
};

export default SearchFilter;
