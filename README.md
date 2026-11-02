# Privatbank transfer desk

A clearly labeled cross-border transfer simulator built with Express. It does not connect to a bank or payment provider and cannot send money, credit a recipient, generate alerts, or make funds available for withdrawal.

## Run locally

```sh
npm install
npm start
```

Open <http://localhost:3000>. Set `PORT` to use a different local port.

## Demo behavior

- Enter a made-up beneficiary label, destination country, currency, and any positive amount with up to two decimal places.
- The server validates the input and keeps simulation records in memory until it restarts.
- Each record is explicitly marked **Not sent**. Summary values are scenario totals, not an account balance.
- No recipient contact details, account numbers, credentials, or payment instructions are collected. No notifications or real transfers are created.

This is a UI and workflow demo only, not a bank or payment service. Do not enter real personal or financial information.
