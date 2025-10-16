'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import {
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  MoreVert,
  Download,
} from '@mui/icons-material';
import ErrorBoundary from '../ErrorBoundary';

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onView?: (id: string | number) => void;
  onBulkAction?: (action: string, ids: (string | number)[]) => void;
  bulkActions?: Array<{
    label: string;
    action: string;
    color?: 'primary' | 'secondary' | 'error';
  }>;
  exportFileName?: string;
  title?: string;
  height?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  bulkActions = [],
  exportFileName = 'data',
  title,
  height = 400,
}) => {
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure component is properly initialized
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleDeleteClick = (id: string | number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };


  const enhancedColumns = useMemo(() => {
    // Ensure columns is always an array
    const safeColumns = Array.isArray(columns) ? columns : [];
    
    const actionColumn: GridColDef = {
      field: 'actions',
      type: 'actions',
      headerName: 'عملیات',
      width: 120,
      getActions: (params) => {
        const actions = [];
        
        if (onView) {
          actions.push(
            <GridActionsCellItem
              icon={<Visibility />}
              label="مشاهده"
              onClick={() => onView(params.id)}
            />
          );
        }
        
        if (onEdit) {
          actions.push(
            <GridActionsCellItem
              icon={<Edit />}
              label="ویرایش"
              onClick={() => onEdit(params.id)}
            />
          );
        }
        
        if (onDelete) {
          actions.push(
            <GridActionsCellItem
              icon={<Delete />}
              label="حذف"
              onClick={() => handleDeleteClick(params.id)}
            />
          );
        }
        
        return actions;
      },
    };

    return [...safeColumns, actionColumn];
  }, [columns, onView, onEdit, onDelete]);

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={{
          fileName: exportFileName,
          delimiter: ',',
          utf8WithBom: true,
        }}
      />
    </GridToolbarContainer>
  );

  // Ensure rows is always an array and properly formatted
  const safeRows = useMemo(() => {
    if (!rows || !Array.isArray(rows)) {
      return [];
    }
    // Ensure each row has an id property
    return rows.map((row, index) => ({
      ...row,
      id: row.id || index,
    }));
  }, [rows]);

  // Don't render DataGrid until component is initialized
  if (!isInitialized) {
    return (
      <Card>
        <CardContent sx={{ p: 0 }}>
          {title && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{title}</Typography>
            </Box>
          )}
          <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>در حال بارگذاری...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardContent sx={{ p: 0 }}>
          {title && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{title}</Typography>
            </Box>
          )}
          <Box sx={{ height, width: '100%' }}>
            <DataGrid
              rows={safeRows}
              columns={enhancedColumns}
              loading={loading}
              onRowClick={onRowClick}
              checkboxSelection={false}
              disableRowSelectionOnClick
              autoHeight={false}
              getRowId={(row) => row.id}
              hideFooterSelectedRowCount={true}
              slots={{
                toolbar: CustomToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5f5f5',
                },
                '& .MuiDataGrid-row.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                },
                '& .MuiDataGrid-row.Mui-selected:hover': {
                  backgroundColor: '#bbdefb',
                },
              }}
              localeText={{
                toolbarColumns: 'ستون‌ها',
                toolbarFilters: 'فیلترها',
                toolbarDensity: 'تراکم',
                toolbarExport: 'خروجی',
                toolbarQuickFilterPlaceholder: 'جستجو...',
                noRowsLabel: 'داده‌ای یافت نشد',
                footerRowSelected: (count) => `${count} ردیف انتخاب شده`,
                footerTotalRows: 'مجموع ردیف‌ها:',
                filterPanelAddFilter: 'افزودن فیلتر',
                filterPanelDeleteIconLabel: 'حذف',
                filterPanelOperator: 'عملگرها',
                filterPanelOperatorAnd: 'و',
                filterPanelOperatorOr: 'یا',
                filterPanelColumns: 'ستون‌ها',
                filterPanelInputLabel: 'مقدار',
                filterPanelInputPlaceholder: 'مقدار فیلتر',
                filterOperatorContains: 'شامل',
                filterOperatorEquals: 'برابر',
                filterOperatorStartsWith: 'شروع با',
                filterOperatorEndsWith: 'پایان با',
                filterOperatorIs: 'است',
                filterOperatorNot: 'نیست',
                filterOperatorAfter: 'بعد از',
                filterOperatorOnOrAfter: 'در یا بعد از',
                filterOperatorBefore: 'قبل از',
                filterOperatorOnOrBefore: 'در یا قبل از',
                filterOperatorIsEmpty: 'خالی',
                filterOperatorIsNotEmpty: 'خالی نیست',
                filterOperatorIsAnyOf: 'هر یک از',
                columnMenuLabel: 'منو',
                columnMenuShowColumns: 'نمایش ستون‌ها',
                columnMenuFilter: 'فیلتر',
                columnMenuHideColumn: 'مخفی کردن ستون',
                columnMenuUnsort: 'لغو مرتب‌سازی',
                columnMenuSortAsc: 'مرتب‌سازی صعودی',
                columnMenuSortDesc: 'مرتب‌سازی نزولی',
                columnHeaderFiltersTooltipActive: (count) => `${count} فیلتر فعال`,
                columnHeaderFiltersLabel: 'نمایش فیلترها',
                columnHeaderSortIconLabel: 'مرتب‌سازی',
                booleanCellTrueLabel: 'بله',
                booleanCellFalseLabel: 'خیر',
                actionsCellMore: 'بیشتر',
                pinToLeft: 'سنجاق به چپ',
                pinToRight: 'سنجاق به راست',
                unpin: 'لغو سنجاق',
                treeDataGroupingHeaderName: 'گروه',
                treeDataExpand: 'بسط',
                treeDataCollapse: 'جمع',
                groupingColumnHeaderName: 'گروه',
                groupColumn: (name) => `گروه بر اساس ${name}`,
                unGroupColumn: (name) => `لغو گروه‌بندی ${name}`,
                detailPanelToggle: 'تغییر وضعیت جزئیات',
                rowReorderingHeaderName: 'ترتیب ردیف‌ها',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف این آیتم اطمینان دارید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>لغو</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
};

export default DataTable;
