import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { visuallyHidden } from '@mui/utils';
import FeedItem from '../models/FeedItem';

type Data = FeedItem;

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
  hiddenOnPhone: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'index',
    numeric: true,
    disablePadding: false,
    label: '#',
    hiddenOnPhone: true,
  },
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Title',
    hiddenOnPhone: false,
  },
  {
    id: 'link',
    numeric: false,
    disablePadding: false,
    label: 'Link',
    hiddenOnPhone: true,
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, rowCount, onRequestSort } = props;

  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            sx={headCell.hiddenOnPhone ? { display: { sm: 'none', md: 'table-cell' } } : {}}
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface FeedPreviewTableProps {
  rows: Data[]
}

export default function FeedPreviewTable(props: FeedPreviewTableProps) {
  const { rows } = props;

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('index');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer>
        <Table>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {rows.slice().sort(getComparator(order, orderBy))
              .map((row) => (
                <TableRow hover key={row.index}>
                  <TableCell component="th" scope="row" align="right" sx={{ display: { sm: 'none', md: 'table-cell' } }}>
                    {row.index}
                  </TableCell>
                  <TableCell>
                    {row.title}
                  </TableCell>
                  <TableCell padding='none' sx={{ display: { sm: 'none', md: 'table-cell' } }}>
                    <a href={row.link} target="_blank" rel="noreferrer">
                      <IconButton>
                        <ArrowForwardIcon />
                      </IconButton>
                    </a>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
