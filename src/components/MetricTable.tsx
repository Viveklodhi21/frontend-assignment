import React, { useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TableSortLabel, TablePagination, Typography
} from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';

import { DataItem, DataRow, MetricsTableProps, SpendMetrics, StabilizedArray } from '../types/types';
import { Box } from '@mui/system';


function descendingComparator(a: DataRow, b: DataRow, orderBy: string): number {
  const metricMatch = orderBy.match(/^(.+?)_(current|absoluteChange|percentChange)$/);
  if (metricMatch) {
    const [, metric, field] = metricMatch;
    const aValue = a[metric]?.[field as keyof SpendMetrics] ?? 0;
    const bValue = b[metric]?.[field as keyof SpendMetrics] ?? 0;
    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  }

  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}
function getComparator<T extends DataRow>(order: 'asc' | 'desc', orderBy: string): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis: StabilizedArray<T>[] = array?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis?.map(el => el[0]);
}



export default function MetricsTable({ data, groupBy, selectedMetrics, tab }: MetricsTableProps) {
  console.log("groupBygroupBy", groupBy);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('sector');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const groupedData = useMemo(() => {
    if (!groupBy?.length) return data;

    const groups: Record<string, any> = {};

    for (const item of data) {
      const key = groupBy.map(k => item[k.toLowerCase() as keyof DataItem] ?? '').join(' | ');

      if (!groups[key]) {
        const baseGroup = Object.fromEntries(
          groupBy.map(k => [k.toLowerCase(), item[k.toLowerCase() as keyof DataItem] ?? ''])
        );

        for (const metric of selectedMetrics ?? []) {
          baseGroup[metric] = {
            current: 0,
            absoluteChange: 0,
            percentChange: 0,
            reference: 0,
          };
        }

        groups[key] = baseGroup;
      }

      const group = groups[key];

      for (const metric of selectedMetrics ?? []) {
        const matchingKey = Object.keys(item).find(
          k => k.replace(/ /g, '').toLowerCase() === metric.replace(/ /g, '').toLowerCase()
        );

        if (!matchingKey) continue;

        const source = item[matchingKey as keyof DataItem];

        if (typeof source === 'object' && source !== null) {
          const fields: (keyof typeof group[typeof metric])[] = ['current', 'absoluteChange', 'percentChange', 'reference'];
          for (const field of fields) {
            const value = (source)[field as keyof SpendMetrics];
            if (value !== undefined && value !== null) {
              group[metric][field] += Number(value);
            }
          }
        } else {
          console.warn(`Metric "${metric}" resolved to key "${matchingKey}" but its value is not an object`, source);
        }
      }
    }

    return Object.values(groups);
  }, [data, groupBy, selectedMetrics]);
  console.log("groupedData", groupedData);

  return (
    <>
      {tab === 0 &&
        groupBy?.length > 0 ? (

        <TableContainer component={Paper} className="mb-6">
          <Table>
            <TableHead>
              <TableRow>
                {groupBy?.map(attr => (
                  <TableCell key={attr}>
                    <TableSortLabel
                      active={orderBy === attr.toLowerCase()}
                      direction={orderBy === attr.toLowerCase() ? order : 'asc'}
                      onClick={e => handleRequestSort(e, attr.toLowerCase())}
                    >
                      {attr}
                    </TableSortLabel>
                  </TableCell>
                ))}
                {selectedMetrics?.map(metric => (
                  ["current", "absoluteChange", "percentChange", "reference"]?.map(field => (
                    <TableCell key={metric + field}>
                      <TableSortLabel
                        active={orderBy === `${metric}_${field}`}
                        direction={orderBy === `${metric}_${field}` ? order : 'asc'}
                        onClick={e => handleRequestSort(e, `${metric}_${field}`)}
                      >
                        {`${metric} ${field === 'current' ? 'Spend' :
                          field === 'absoluteChange' ? 'Abs Change' :
                            field === 'percentChange' ? '% Change' :
                              field === 'reference' ? 'Reference' :
                                field
                          }`}                    </TableSortLabel>
                    </TableCell>
                  ))
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(groupedData, getComparator(order, orderBy))
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                ?.map((row, idx) => (
                  <TableRow key={idx}>
                    {groupBy?.map(attr => (
                      <TableCell key={attr}>{row[attr?.toLowerCase()]}</TableCell>
                    ))}
                    {selectedMetrics?.map(metric => (
                      ["current", "absoluteChange", "percentChange", "reference"].map(field => (
                        <TableCell key={metric + field}>
                          {field === 'percentChange'
                            ? `${(row[metric][field] || 0).toFixed(2)}%`
                            : (row[metric][field] || 0).toLocaleString()}
                        </TableCell>
                      ))
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={groupedData?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>) : <Box
          sx={{
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '1.1rem',
          }}
        >
        No data found.
      </Box>}

      {tab === 1 && (selectedMetrics?.length ?? 0) > 0 && (
        <div style={{ height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Spend by: {(groupBy ?? []).join(', ').toLocaleLowerCase()}
          </Typography>
          <ResponsiveBar
            data={groupedData.map(row => ({
              ...row,
              ...(selectedMetrics ?? []).reduce((acc: Record<string, number>, metric) => {
                acc[metric] = row[metric]?.current || 0;
                return acc;
              }, {} as Record<string, number>)
            }))}
            keys={selectedMetrics}
            indexBy={(groupBy?.[0]?.toLowerCase() ?? 'sector')}
            margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            groupMode="grouped"
            colors={{ scheme: 'nivo' }}
            axisBottom={{ tickRotation: -30 }}
            axisLeft={{ format: v => `${v / 1000}k` }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[{
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              symbolSize: 20,
              effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
            }]}
          />
        </div>
      )}
    </>
  );
}
