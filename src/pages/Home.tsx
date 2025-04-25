import React, { useState, useMemo } from 'react';
import {
  Tabs,
  Tab,
  CardContent,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { subMonths } from 'date-fns';
import MetricsTable from '../components/MetricTable';
import { userMetricsData, mockUsers } from '../data/mockData';
import dayjs from 'dayjs';

const metrics = ['My Spend', 'Same Store Spend', 'New Store Spend', 'Lost Store Spend'];
const groupAttributes = ['Country', 'State', 'City', 'Sector', 'Category'];
const sectors = ['Retail', 'Hospitality'];
const categories = ['Juice', 'Snacks', "Beverages", "Frozen Foods"];
const metricKeyMap = {
  "My Spend": "mySpend",
  "Same Store Spend": "sameStoreSpend",
  "New Store Spend": "newStoreSpend",
  "Lost Store Spend": "lostStoreSpend",
};
export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(mockUsers[0].id);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(subMonths(new Date(), 12)), dayjs()]);
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(metrics);
  const [groupBy, setGroupBy] = useState<string[]>(groupAttributes);
  const normalizedGroupBy = groupBy?.map(attr => attr.toLowerCase());

  const currentData = userMetricsData[selectedUser] || [];

  const groupedData = useMemo(() => {
    const [filterStart, filterEnd] = dateRange;

    const hasFilters = selectedSector || selectedCategory || (filterStart && filterEnd);

    const filtered = hasFilters
      ? currentData.filter(item => {
        const itemStart = new Date(item.startDate);
        const itemEnd = new Date(item.endDate);

        const inDateRange = itemStart <= filterEnd.toDate() && itemEnd >= filterStart.toDate();
        const inSector = !selectedSector || item.sector === selectedSector;
        const inCategory = !selectedCategory || item.category === selectedCategory;

        return inDateRange && inSector && inCategory;
      })
      : currentData;

    if (!groupBy?.length) return filtered;

    const groups = new Map();

    for (const item of filtered) {
      const key = groupBy.map(k => item[k.toLowerCase()] ?? '').join(' | ');

      if (!groups.has(key)) {
        const baseGroup = Object.fromEntries(
          groupBy.map(k => [k.toLowerCase(), item[k.toLowerCase()] ?? ''])
        );

        for (const metric of selectedMetrics) {
          baseGroup[metric] = {
            current: 0,
            reference: 0,
            absoluteChange: 0,
            percentChange: 0,
          };
        }

        groups.set(key, baseGroup);
      }

      const group = groups.get(key);

      for (const metric of selectedMetrics) {
        const mKey = metricKeyMap[metric as keyof typeof metricKeyMap];
        const metricData = item[mKey];

        if (metricData) {
          group[metric].current += Number(metricData.current ?? 0);
          group[metric].reference += Number(metricData.reference ?? 0);
          group[metric].absoluteChange += Number(metricData.absoluteChange ?? 0);
          group[metric].percentChange += Number(metricData.percentChange ?? 0);
        }
      }
    }

    return Array.from(groups.values());
  }, [currentData, dateRange, selectedSector, selectedCategory, groupBy, selectedMetrics]);

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Tabs value={tab} onChange={(_, newVal) => setTab(newVal)}>
            <Tab role='tab' label="Metrics View" />
            <Tab role='tab' label="Analytics View" />
          </Tabs>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            Active User: {mockUsers.find(user => user.id === selectedUser)?.name}
            <Button variant="contained" onClick={() => setUserDialogOpen(true)}>My Members</Button>
          </div>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, alignItems: 'baseline' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateRangePicker
                  disableFuture
                  value={dateRange}
                  onChange={(newValue) => {
                    if (newValue[0] && newValue[1]) {
                      setDateRange([newValue[0] as dayjs.Dayjs, newValue[1] as dayjs.Dayjs]);
                    }
                  }}
                  minDate={dayjs(subMonths(new Date(), 12))}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: () => ({
                      label: 'Date',
                      fullWidth: true,
                      variant: 'outlined',
                    }),
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth>
                <InputLabel id="sector-label">Sector</InputLabel>
                <Select
                  labelId="sector-label"
                  label="sector"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2,
                    },
                  }}
                >
                  {sectors.map(sector => (
                    <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="metric-label">Metric Selector</InputLabel>
                <Select
                  labelId="metric-label"
                  id="metric-select"
                  multiple
                  value={groupBy?.length !== 0 ? selectedMetrics : [""]}
                  onChange={(e) => setSelectedMetrics(e.target.value as string[])}
                  label="Metric Selector"
                  renderValue={(selected) => selected.join(', ')}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2,
                    },
                  }}
                >
                  {metrics.map(metric => (
                    <MenuItem key={metric} value={metric}>
                      <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                      <ListItemText primary={metric} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="group-by-label">Group By</InputLabel>
                <Select
                  labelId="group-by-label"
                  id="group-by-select"
                  label="Group By"
                  multiple
                  value={groupBy}
                  onChange={(e) => {
                    const newValue = e.target.value as string[];
                    setGroupBy(newValue);
                    if (newValue.length === 0) {
                      setSelectedMetrics([]); // clear metrics when no group by
                    }
                  }}
                  renderValue={(selected) => selected.join(', ')}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2,
                    },
                  }}
                >
                  {groupAttributes.map(attr => (
                    <MenuItem key={attr} value={attr}>
                      <Checkbox checked={groupBy.indexOf(attr) > -1} />
                      <ListItemText primary={attr} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>


        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
          <DialogTitle>Select a Member</DialogTitle>
          <DialogContent>
            {mockUsers.map(user => (
              <Box
                key={user.id}
                sx={{
                  p: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedUser(user.id);
                  setUserDialogOpen(false);
                }}
              >
                {user.name}
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      </Box>
      <MetricsTable
        dateRange={[dateRange[0].toDate(), dateRange[1].toDate()]}
        data={groupedData}
        groupBy={normalizedGroupBy.length ? normalizedGroupBy : []}
        selectedMetrics={selectedMetrics}
        tab={tab}
      />
    </>
  );
}
