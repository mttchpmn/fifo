# FiFo

Financial Forecasting in your terminal!

## Overview

FiFo is a Typescript module to calculate your financial position for an upcoming pay period. It utilises a configuration file - `conf.json` - which holds the data around your net income, pay frequency, known payday (for date calculations), and an object of your weekly, fortnightly, and monthly payments.

FiFo then calculates your next pay period, and which of your recurring payments will occur during this period. It then totals the amounts, subtracting from your net income, and displays this information in the terminal.

FiFo has been built as a fast prototype for a later build of a C-Sharp API to support a web application

## Installation

Clone or download the repo onto your local machine.

## Configuration

Edit `conf.example.json` and replace with your own data, saving it as `conf.json`.

## Usage

```
cd fifo
yarn start
```

FiFo will calculate data based on what has been entered into `conf.json`, and display the data in your terminal as below:

```
------------------------- PAY PERIOD ------------------------------

Starting:                2020-12-21
Endng:                   2021-01-03
Payday:                  2020-12-24

Net Income:             $ 5000
Total Outgoings:        $ 750.00
Remaining:              $ 4250.00

-------------------------------------------------------------------

┌─────────┬─────────────────┬─────────┬───────────────┬────────────┐
│ (index) │      name       │  code   │     date      │   amount   │
├─────────┼─────────────────┼─────────┼───────────────┼────────────┤
│    0    │     'rent'      │ 'rent'  │ 'Thu, Dec 24' │ '$ 210.00' │
│    1    │     'bills'     │ 'rent'  │ 'Thu, Dec 24' │ '$ 40.00'  │
│    2    │     'rent'      │ 'rent'  │ 'Thu, Dec 31' │ '$ 210.00' │
│    3    │     'bills'     │ 'rent'  │ 'Thu, Dec 31' │ '$ 40.00'  │
│    4    │   'Car Loan'    │ 'debt'  │ 'Thu, Dec 31' │ '$ 200.00' │
│    5    │  'Phone Bill'   │ 'bills' │ 'Tue, Dec 29' │ '$ 50.00'  │
└─────────┴─────────────────┴─────────┴───────────────┴────────────┘
```

## Roadmap

FiFo is currently in a _as-is_ state, as development will likely continue in the form of a larger, more feature-complete, C-Sharp API. That being said, the following tasks exist to flesh-out FiFo into a more usable and fully feature CLI program.

- Add unit tests
- Add UI for adding data to conf.json (rather than editing JSON)
- Fix bug with fornightly payments for single-week pay periods
- Utilise `blessed` library to provide rich Terminal interface
- Add support for one-off / ad-hoc payments
- Add support for calculation data for pay periods other than immediately upcoming one
