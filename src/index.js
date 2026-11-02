const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const simulations = [];

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/simulations', (_request, response) => {
  response.json(simulations);
});

app.post('/api/simulations', (request, response) => {
  const { beneficiary, country, currency, amount } = request.body || {};
  const amountText = String(amount ?? '').trim();
  const amountPattern = /^\d+(?:\.\d{1,2})?$/;
  const supportedCurrencies = new Set(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY', 'NGN', 'BRL']);

  if (typeof beneficiary !== 'string' || beneficiary.trim().length < 1 || beneficiary.trim().length > 80) {
    return response.status(400).json({ error: 'Enter a test beneficiary label (up to 80 characters).' });
  }
  if (typeof country !== 'string' || country.trim().length < 2 || country.trim().length > 80) {
    return response.status(400).json({ error: 'Choose a destination country.' });
  }
  if (!supportedCurrencies.has(currency)) {
    return response.status(400).json({ error: 'Choose a supported demo currency.' });
  }
  if (!amountPattern.test(amountText) || !Number.isFinite(Number(amountText)) || Number(amountText) <= 0) {
    return response.status(400).json({ error: 'Enter an amount greater than zero with up to two decimal places.' });
  }

  const simulation = {
    id: crypto.randomUUID(),
    reference: `DEMO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    beneficiary: beneficiary.trim(),
    country: country.trim(),
    currency,
    amount: amountText,
    createdAt: new Date().toISOString(),
    status: 'Not sent',
  };
  simulations.unshift(simulation);
  return response.status(201).json(simulation);
});

app.listen(port, () => {
  console.log(`Privatbank demo is running at http://localhost:${port}`);
});
