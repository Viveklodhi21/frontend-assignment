import React from "react";
import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./pages/Home";
import userEvent from "@testing-library/user-event";
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";

jest.mock("../src/components/MetricTable.tsx", () => (props) => (
  <div data-testid="metric-table">Metrics Table Rendered</div>
));

const renderWithProvider = (ui) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>{ui}</LocalizationProvider>
  );
};

describe("Dashboard Component", () => {
  test("renders tabs and default content", () => {
    renderWithProvider(<Dashboard />);

    expect(screen.getByText("Metrics View")).toBeTruthy();
    expect(screen.getByText("Analytics View")).toBeTruthy();
    expect(screen.getByText("My Members")).toBeTruthy();
  });
  test("can open and select user from user dialog", async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dashboard />
      </LocalizationProvider>
    );

    expect(screen.getByText("My Members")).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /my members/i }));

    const userOption = await screen.findByText("Bob");
    expect(userOption).toBeInTheDocument();

    userEvent.click(userOption);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("updates sector filter", async () => {
    render(<Dashboard />);
    const select = screen.getByRole("combobox", { name: /sector/i });
    userEvent.click(select);

    const option = await screen.findByRole("option", { name: "Retail" });
    userEvent.click(option);

    await waitFor(() => {
      expect(select).toHaveTextContent("Retail");
    });
  });

  test("updates category filter", async () => {
    render(<Dashboard />);

    const categoryDropdown = screen.getByRole("combobox", {
      name: /category/i,
    });

    userEvent.click(categoryDropdown);

    const option = await screen.findByRole("option", { name: "Snacks" });
    userEvent.click(option);

    await waitFor(() => {
      expect(categoryDropdown).toHaveTextContent("Snacks");
    });
  });

  test("selects multiple group by attributes", async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dashboard />
      </LocalizationProvider>
    );

    const groupBySelect = screen.getByRole("combobox", { name: /group by/i });
    userEvent.click(groupBySelect);

    const countryOption = await screen.findByRole("option", {
      name: "Country",
    });
    userEvent.click(countryOption);

    const cityOption = await screen.findByRole("option", { name: "City" });
    userEvent.click(cityOption);

    await waitFor(() => {
      expect(screen.getByText("Country")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("City")).toBeInTheDocument();
    });
  });

  test("selects a single group by attribute", async () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dashboard />
      </LocalizationProvider>
    );

    const groupBySelect = screen.getByLabelText("Group By");

    userEvent.click(groupBySelect);

    const cityOption = await screen.findByRole("option", { name: "City" });
    userEvent.click(cityOption);

    const selectedChips = screen.getAllByText("City");
    expect(selectedChips.length).toBeGreaterThan(0);
  });
});
