import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // ✅ this is essential
import MetricsTable from './components/MetricTable';
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (/Warning.*not wrapped in act/.test(msg)) return;
      console.error(msg);
    });
  });
jest.mock('@nivo/bar', () => ({
  ResponsiveBar: () => <div data-testid="mock-bar-chart" />,
}));

const mockData= [
  {
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    sector: "Retail",
    category: "Juice",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    mySpend: {
      current: 120000,
      reference: 100000,
      absoluteChange: 20000,
      percentChange: 20,
    },
    sameStoreSpend: {
      current: 95000,
      reference: 90000,
      absoluteChange: 5000,
      percentChange: 5.56,
    },
    newStoreSpend: {
      current: 15000,
      reference: 10000,
      absoluteChange: 5000,
      percentChange: 50,
    },
    lostStoreSpend: {
      current: 13000,
      reference: 15000,
      absoluteChange: -5000,
      percentChange: -33.33,
    },
  },
];

describe('MetricsTable - Chart rendering block', () => {
  it('does not render the chart when tab is 0', () => {
    render(
      <MetricsTable
        data={mockData}
        groupBy={['Sector']}
        selectedMetrics={['spend']}
        tab={0}
      />
    );
    expect(screen.queryByTestId('mock-bar-chart')).not.toBeInTheDocument();
  });

  it('does not render the chart when selectedMetrics is empty', () => {
    render(
      <MetricsTable
        data={mockData}
        groupBy={['Sector']}
        selectedMetrics={[]}
        tab={1}
      />
    );
    expect(screen.queryByTestId('mock-bar-chart')).not.toBeInTheDocument();
  });

  it('renders the chart when tab is 1 and selectedMetrics are present', () => {
    render(
      <MetricsTable
        data={mockData}
        groupBy={['Sector']}
        selectedMetrics={['spend']}
        tab={1}
      />
    );
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });
});
