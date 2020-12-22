import { DateTime } from "luxon";
import { promises as fs } from "fs";

type Payment = {
  name: string;
  code: string;
  amount: number;
  frequency: string;
  day: number;
  date?: DateTime;
};

type Payments = {
  weekly: Payment[];
  fortnightly: Payment[];
  monthly: Payment[];
};

type PayPeriod = {
  startDate: DateTime;
  payday: DateTime;
  endDate: DateTime;
  numWeeks: number;
};

type PeriodSummary = {
  period: PayPeriod;
  total: number;
  payments: Payment[];
};

const readConfFile = async (path: string) => {
  try {
    const file = await fs.readFile(path, "utf8");

    return JSON.parse(file);
  } catch (error) {
    console.error(
      "Error reading `conf.json` please make sure the file exists."
    );

    process.exit(1);
  }
};

const validateConfFile = (confFile: string): void => {
  // TODO - Implement validation
};

const getPayPeriod = (
  referenceDate: string,
  payFrequencyWeeks: number
): PayPeriod => {
  const today = DateTime.local();
  const knownPayDate = DateTime.fromFormat(referenceDate, "yyyy-MM-dd");

  const numberOfPeriodsDifference =
    today.diff(knownPayDate, "weeks").weeks / payFrequencyWeeks;

  const nextPayDay = knownPayDate.plus({
    weeks: Math.ceil(numberOfPeriodsDifference) * payFrequencyWeeks,
  });

  const dayOfWeek = nextPayDay.weekday - 1; // Use 0 referencing

  const startOfPayPeriod = nextPayDay.minus({ days: dayOfWeek });

  const endOfPayPeriod = startOfPayPeriod
    .plus({ weeks: payFrequencyWeeks })
    .minus({ days: 1 });

  return {
    startDate: startOfPayPeriod,
    payday: nextPayDay,
    endDate: endOfPayPeriod,
    numWeeks: payFrequencyWeeks,
  };
};

const getWeeklyPayments = (period: PayPeriod, payments: Payment[]) => {
  const result = [];

  // Use For loop to add multiple copies of payment objects if pay period is more than one week
  for (let i = 0; i < period.numWeeks; i++) {
    const paymentsWithDatesForTheWeek = payments.map((p) => {
      const offset = p.day - 1 + i * 7;
      const date = period.startDate.plus({ days: offset });

      return { ...p, date };
    });

    result.push(...paymentsWithDatesForTheWeek);
  }

  return result;
};

const getFortnightlyPayments = (period: PayPeriod, payments: Payment[]) => {
  const result = [];

  // !BUG - This could will work incorrectly if the pay period is only 1 week long,
  // !      as we don't have a reference point for the fortnight

  // Use For loop to add multiple copies of payment objects if pay period is more than one week
  for (let i = 0; i < period.numWeeks / 2; i++) {
    const paymentsWithDatesForTheFortnight = payments.map((p) => {
      const offset = p.day - 1 + i * 14;
      const date = period.startDate.plus({ days: offset });

      return { ...p, date };
    });

    result.push(...paymentsWithDatesForTheFortnight);
  }

  return result;
};

const getMonthlyPayments = (period: PayPeriod, payments: Payment[]) => {
  const startOfMonth = period.startDate.startOf("month");

  const result = payments.map((p) => {
    const offset = p.day - 1; // Convert to zero based indexing
    const date = startOfMonth.plus({ days: offset });

    return { ...p, date };
  });

  return result;
};

const filterPaymentsList = (period: PayPeriod, payments: Payments) => {
  // TODO - Add support for yearly

  const weekly = getWeeklyPayments(period, payments.weekly);
  const fortnightly = getFortnightlyPayments(period, payments.fortnightly);
  const monthly = getMonthlyPayments(period, payments.monthly);

  const result = [...weekly, ...fortnightly, ...monthly].filter(
    (p) => p.date >= period.startDate && p.date <= period.endDate
  );

  return result;
};

const calculateTotal = (payments: Payment[]) => {
  return payments.reduce((acc, cur) => acc + cur.amount, 0);
};

const displayData = (
  netIncome: number,
  { period, total, payments }: PeriodSummary
): void => {
  console.log(
    "------------------------- PAY PERIOD -------------------------\n"
  );

  console.log("Starting: \t\t", period.startDate.toISODate());
  console.log("Endng: \t\t\t", period.endDate.toISODate());
  console.log("Payday: \t\t", period.payday.toISODate());

  console.log("\nNet Income: \t\t$", netIncome);
  console.log("Total Outgoings: \t$", total);
  console.log("Remaining: \t\t$", netIncome - total);

  console.log(
    "\n--------------------------------------------------------------\n"
  );

  const readablePayments = payments.map(({ name, code, amount, date }) => {
    return {
      name,
      code,
      date: date!.toLocaleString({
        weekday: "short",
        month: "short",
        day: "2-digit",
      }),
      amount: `$ ${amount.toFixed(2)}`,
    };
  });

  console.table(readablePayments);
};

const main = async () => {
  const {
    knownPayday,
    netIncome,
    payFrequencyWeeks,
    payments: paymentsList,
  } = await readConfFile("./conf.json");

  const period = getPayPeriod(knownPayday, payFrequencyWeeks);
  const payments = filterPaymentsList(period, paymentsList);
  const total = calculateTotal(payments);

  displayData(netIncome, { period, total, payments });
};

main();
