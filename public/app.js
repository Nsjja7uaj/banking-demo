const form = document.querySelector('#transfer-form');
const message = document.querySelector('#form-message');
const list = document.querySelector('#simulation-list');
const currencySelect = document.querySelector('#currency');
const currencyCode = document.querySelector('#currency-code');
const currencySymbol = document.querySelector('#currency-symbol');
const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', INR: '₹', JPY: '¥', NGN: '₦', BRL: 'R$' };
const numberFormatters = {};
let simulations = [];

function formatter(currency) {
  if (!numberFormatters[currency]) {
    numberFormatters[currency] = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return numberFormatters[currency];
}

function updateCurrency() {
  const currency = currencySelect.value;
  currencyCode.textContent = currency;
  currencySymbol.textContent = symbols[currency] || currency;
}

function render() {
  document.querySelector('#simulation-count').textContent = String(simulations.length);
  document.querySelector('#activity-count').textContent = `${simulations.length} ${simulations.length === 1 ? 'record' : 'records'}`;
  const totals = new Map();
  for (const simulation of simulations) {
    totals.set(simulation.currency, (totals.get(simulation.currency) || 0) + Number(simulation.amount));
  }
  const totalLabel = totals.size === 0
    ? '$0.00'
    : [...totals].map(([currency, amount]) => formatter(currency).format(amount)).join(' · ');
  document.querySelector('#total-value').textContent = totalLabel;

  list.replaceChildren();
  if (simulations.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    const cell = document.createElement('td');
    cell.colSpan = 3;
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const icon = document.createElement('span');
    icon.className = 'empty-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '↗';
    const title = document.createElement('strong');
    title.textContent = 'No simulations yet';
    const detail = document.createElement('span');
    detail.textContent = 'Your demo records will appear here.';
    empty.append(icon, title, detail);
    cell.append(empty);
    row.append(cell);
    list.append(row);
    return;
  }

  for (const simulation of simulations) {
    const row = document.createElement('tr');
    const beneficiaryCell = document.createElement('td');
    const beneficiary = document.createElement('div');
    beneficiary.className = 'beneficiary-cell';
    const avatar = document.createElement('span');
    avatar.className = 'recipient-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = simulation.beneficiary.trim().slice(0, 2).toUpperCase();
    const identity = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'recipient-name';
    name.textContent = simulation.beneficiary;
    const country = document.createElement('span');
    country.className = 'recipient-country';
    country.textContent = `${simulation.country} · ${simulation.reference}`;
    identity.append(name, country);
    beneficiary.append(avatar, identity);
    beneficiaryCell.append(beneficiary);

    const amountCell = document.createElement('td');
    amountCell.className = 'amount-cell';
    amountCell.textContent = formatter(simulation.currency).format(Number(simulation.amount));

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = 'table-status';
    status.textContent = simulation.status;
    statusCell.append(status);
    row.append(beneficiaryCell, amountCell, statusCell);
    list.append(row);
  }
}

async function loadSimulations() {
  try {
    const response = await fetch('/api/simulations');
    if (!response.ok) throw new Error('Could not load session records.');
    simulations = await response.json();
    render();
  } catch (error) {
    message.textContent = error.message;
    message.classList.add('error');
  }
}

currencySelect.addEventListener('change', updateCurrency);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  message.classList.remove('error');
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not record this simulation.');
    simulations.unshift(result);
    render();
    form.reset();
    updateCurrency();
    message.textContent = `Simulation ${result.reference} recorded. No funds were sent and no recipient was notified.`;
  } catch (error) {
    message.textContent = error.message;
    message.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
});

const today = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
document.querySelector('#today').textContent = today.format(new Date());
updateCurrency();
loadSimulations();
