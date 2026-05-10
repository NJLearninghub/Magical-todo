'use strict';

const path = require('path');
const fs = require('fs');

// Load categories from JSON (works for both dev and packaged app)
function loadCategories() {
  const candidates = [
    path.join(__dirname, '../../src/constants/categories.json'),
    path.join(process.resourcesPath || '', 'app/src/constants/categories.json'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {}
  }
  return [];
}

let _categories = null;
function getCategories() {
  if (!_categories) _categories = loadCategories();
  return _categories;
}

function categorize(description) {
  const upper = description.toUpperCase();
  for (const rule of getCategories()) {
    for (const kw of (rule.keywords || [])) {
      if (upper.includes(kw.toUpperCase())) return rule.category;
    }
  }
  return 'Other';
}

// ── Amount parsing ──────────────────────────────────────────────────────────
function parseAmount(str) {
  if (str === null || str === undefined || str === '') return null;
  const s = String(str).replace(/[₹$,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.abs(n);
}

// ── Date parsing ────────────────────────────────────────────────────────────
const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };

function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // MM/DD/YYYY (US format)
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    const moN = parseInt(mo), dN = parseInt(d);
    // Disambiguate: if first number >12 it must be day
    if (moN > 12) return `${y}-${d.padStart(2,'0')}-${mo.padStart(2,'0')}`;
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // DD Mon YYYY  or  DD-Mon-YYYY  or  DD Mon YY
  m = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3})[\s\-](\d{2,4})$/);
  if (m) {
    const [, d, mon, y] = m;
    const mo = MONTHS[mon.toLowerCase()];
    if (!mo) return null;
    const year = y.length === 2 ? (parseInt(y) > 50 ? '19'+y : '20'+y) : y;
    return `${year}-${String(mo).padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  // YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s;

  // Excel serial date (number)
  const num = parseFloat(s);
  if (!isNaN(num) && num > 30000 && num < 60000) {
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    return d.toISOString().slice(0,10);
  }
  return null;
}

// ── Deterministic ID ────────────────────────────────────────────────────────
function makeId(fileName, date, amount, description) {
  const safe = (s) => String(s || '').replace(/[^a-z0-9]/gi, '').slice(0, 15);
  return `${safe(fileName)}-${date}-${Math.round((amount||0)*100)}-${safe(description)}`;
}

// ── PDF text → transactions ─────────────────────────────────────────────────
function extractFromPdfText(text, fileName) {
  const transactions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Regex patterns for common bank statement layouts
  // Pattern 1: DD/MM/YYYY ... amount (possibly with Dr/Cr suffix)
  // Pattern 2: Amount at end, date at start
  const datePattern = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}[\s\-][A-Za-z]{3}[\s\-]\d{2,4})\b/;
  const amountPattern = /(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:Dr|Cr|CR|DR)?/i;
  const creditWords = /\b(cr|credit|deposit|salary|interest|refund|cashback|received)\b/i;
  const debitWords = /\b(dr|debit|withdrawal|purchase|payment|charge|transfer out)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const date = parseDate(dateMatch[1]);
    if (!date) continue;

    // Find all amounts in the line
    const amounts = [];
    const amtRegex = /(?:₹|Rs\.?|INR\s*)?([\d,]+\.\d{2})/g;
    let am;
    while ((am = amtRegex.exec(line)) !== null) {
      const v = parseAmount(am[1]);
      if (v && v > 0) amounts.push(v);
    }
    if (amounts.length === 0) continue;

    // Description: text between date and first amount, cleaned up
    const afterDate = line.slice(dateMatch.index + dateMatch[0].length).trim();
    const descMatch = afterDate.match(/^([A-Za-z0-9\s\/\-_@#&'.,*]+?)(?=\s*(?:₹|Rs\.?|\d{1,3},))/);
    const description = (descMatch ? descMatch[1] : afterDate).replace(/\s+/g,' ').trim().slice(0, 80) || 'Transaction';

    // Determine credit vs debit
    const lineUpper = line.toUpperCase();
    let type = 'debit'; // default for credit card statements
    if (/\bCR\b/.test(lineUpper) || creditWords.test(line)) type = 'credit';
    if (/\bDR\b/.test(lineUpper) || debitWords.test(line)) type = 'debit';

    // Use the last amount in the line (usually the transaction amount, not running balance)
    const amount = amounts[amounts.length > 1 ? amounts.length - 2 : 0];

    const id = makeId(fileName, date, amount, description);
    transactions.push({
      id,
      date,
      description,
      amount,
      type,
      category: categorize(description),
      sourceFile: fileName,
    });
  }

  return transactions;
}

// ── Excel rows → transactions ───────────────────────────────────────────────
function extractFromExcelRows(sheets, fileName) {
  const transactions = [];

  for (const { rows } of sheets) {
    if (rows.length < 2) continue;

    // Find header row (first row with recognisable column names)
    let headerIdx = -1;
    let colDate = -1, colDesc = -1, colDebit = -1, colCredit = -1, colAmount = -1;

    for (let r = 0; r < Math.min(10, rows.length); r++) {
      const row = rows[r].map(c => String(c).toLowerCase().trim());
      const d = row.findIndex(c => /^(date|txn date|value date|transaction date|posting date)$/.test(c));
      const desc = row.findIndex(c => /^(description|narration|particulars|remarks|details|merchant|transaction detail)/.test(c));
      const deb = row.findIndex(c => /^(debit|withdrawal|dr amount|amount debit|debit amount)/.test(c));
      const cred = row.findIndex(c => /^(credit|deposit|cr amount|amount credit|credit amount)/.test(c));
      const amt = row.findIndex(c => /^(amount|transaction amount|txn amount)$/.test(c));

      if (d !== -1 && (desc !== -1 || amt !== -1 || deb !== -1)) {
        headerIdx = r;
        colDate = d;
        colDesc = desc !== -1 ? desc : (amt !== -1 ? amt : 0);
        colDebit = deb;
        colCredit = cred;
        colAmount = amt;
        break;
      }
    }

    if (headerIdx === -1) {
      // Fallback: assume first row is header, col 0=date, 1=desc, 2=amount
      headerIdx = 0;
      colDate = 0; colDesc = 1; colAmount = 2;
    }

    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every(c => !c)) continue;

      const rawDate = row[colDate];
      const date = parseDate(rawDate);
      if (!date) continue;

      const description = String(row[colDesc] || '').trim().slice(0, 80) || 'Transaction';

      let amount = null;
      let type = 'debit';

      if (colDebit !== -1 && colCredit !== -1) {
        const deb = parseAmount(row[colDebit]);
        const cred = parseAmount(row[colCredit]);
        if (cred && cred > 0) { amount = cred; type = 'credit'; }
        else if (deb && deb > 0) { amount = deb; type = 'debit'; }
        else continue;
      } else if (colAmount !== -1) {
        const raw = String(row[colAmount] || '');
        const v = parseAmount(raw);
        if (!v) continue;
        amount = v;
        // Negative = debit in many exports
        const rawN = parseFloat(String(row[colAmount]).replace(/[₹$,\s]/g, ''));
        if (rawN < 0) type = 'debit';
        else if (creditWords.test(description)) type = 'credit';
        else type = 'debit';
      } else continue;

      if (!amount) continue;

      const id = makeId(fileName, date, amount, description);
      transactions.push({
        id,
        date,
        description,
        amount,
        type,
        category: categorize(description),
        sourceFile: fileName,
      });
    }
  }

  return transactions;
}

const creditWords = /\b(salary|credit|deposit|interest|refund|cashback|received|reversal)\b/i;

module.exports = { extractFromPdfText, extractFromExcelRows };
