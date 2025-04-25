# Getting Started with frontend assignment
Clone the project from (https://github.com/Viveklodhi21/frontend-assignment.git).

cd frontend-assignment

In the project directory, you can run:
### `npm install`
### `npm start`

Runs the app in the local mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

For running the unit test cases for dashboard and metric table and graph 

### `npm run build`

Builds the app for production to the `build` folder.\

### `mock data used`

{
"country": "India",
"state": "Maharashtra",
"city": "Mumbai",
"sector": "Retail",
"category": "Juice",
"startDate": "2024-04-01",
"endDate": "2024-04-30",
"mySpend": {
"current": 120000,
"reference": 100000,
"absoluteChange": 20000,
"percentChange": 20
},
"sameStoreSpend": {
"current": 95000,
"reference": 90000,
"absoluteChange": 5000,
"percentChange": 5.56
},
...
}

### Assumptions

Metrics like mySpend, sameStoreSpend, etc., are dynamic and may vary.

Grouping attributes (e.g., Country, City) are flexible and user-selected.

reference values are aggregated alongside other metric fields.

If Group By is empty, Metric selection is cleared.

No matching data = "No data found" message shown in UI.

### To test or simulate user switching and filters

Click on the Members buttton and select a user and the data will be chanegd accordingly

And for applying filters we have to select gropup by first before applying any filter
