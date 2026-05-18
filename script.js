// --- Global: manage active calculator & histories ---

const calcTypeSelect = document.getElementById('calcType');
const sections = document.querySelectorAll('.calc-section');
const historyTitle = document.getElementById('historyTitle');
const historyList = document.getElementById('historyList');

// store up to 50 entries per calculator
const MAX_HISTORY = 50;
const histories = {
  basic: [],
  scientific: [],
  gpa: [],
  bmi: [],
  emi: [],
  tax: [],
  statistical: [],
  construction: [],
  converter: [],
  interest: [],
  age: []
};

let currentCalcId = 'basic';

// change visible calculator when dropdown changes
calcTypeSelect.addEventListener('change', () => {
  const selected = calcTypeSelect.value;
  currentCalcId = selected;

  // show/hide sections
  sections.forEach(section => {
    if (section.id === selected) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });

  // update history title
  const titleMap = {
    basic: 'Basic Calculator History',
    scientific: 'Scientific Calculator History',
    gpa: 'GPA Calculator History',
    bmi: 'BMI Calculator History',
    emi: 'EMI / Loan Calculator History',
    tax: 'Tax Calculator History',
    statistical: 'Statistical Calculator History',
    construction: 'Construction Calculator History',
    converter: 'Currency & Unit Converter History',
    interest: 'Interest Calculator History',
    age: 'Age Calculator History'
  };
  historyTitle.textContent = titleMap[selected] || 'History';

  // render that calculator's history
  renderHistory();
});

function addToHistory(entry) {
  const list = histories[currentCalcId];
  list.push(entry);
  if (list.length > MAX_HISTORY) {
    list.shift(); // remove oldest
  }
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  const list = histories[currentCalcId];

  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function clearCurrentHistory() {
  histories[currentCalcId] = [];
  renderHistory();
}

// --- BASIC CALCULATOR LOGIC ---

const display = document.getElementById('display');

function resetIfZero() {
  if (display.value === '0') {
    display.value = '';
  }
}
// --- KEYBOARD SUPPORT FOR BASIC CALCULATOR ---

document.addEventListener('keydown', event => {
  // Use basic calculator when user types
  // Ignore if focus is inside a text input that is not the basic display
  const active = document.activeElement;
  if (active && active.tagName === 'INPUT' && active.id !== 'display') {
    return;
  }

  const key = event.key;

  // Numbers and decimal
  if (key >= '0' && key <= '9') {
    appendValue(key);
    event.preventDefault();
    return;
  }
  if (key === '.') {
    appendValue('.');
    event.preventDefault();
    return;
  }

  // Operators
  if (key === '+' || key === '-' || key === '*' || key === '/') {
    appendValue(key);
    event.preventDefault();
    return;
  }

  // Enter or = → calculate
  if (key === 'Enter' || key === '=') {
    calculate();
    event.preventDefault();
    return;
  }

  // Backspace
  if (key === 'Backspace') {
    backspace();
    event.preventDefault();
    return;
  }

  // Escape (Esc) → clear
  if (key === 'Escape') {
    clearDisplay();
    event.preventDefault();
    return;
  }
});
// --- BMI CALCULATOR ---
function calculateBMI() {
  const weight = parseFloat(document.getElementById('bmiWeight').value);
  const heightCm = parseFloat(document.getElementById('bmiHeight').value);
  const resultEl = document.getElementById('bmiResult');

  if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
    resultEl.textContent = 'Please enter valid weight and height.';
    return;
  }

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM); // BMI = kg / m^2 [web:82][web:87]

  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obesity'; 

  const text = `BMI: ${bmi.toFixed(1)} (${category})`;

  resultEl.textContent = text;

  // Save to BMI history
  const previousCalc = currentCalcId;
  currentCalcId = 'bmi';
  addToHistory(text);
  currentCalcId = previousCalc;
}
// --- EMI / LOAN CALCULATOR ---
function calculateEMI() {
  const principal = parseFloat(document.getElementById('loanAmount').value);
  const annualRate = parseFloat(document.getElementById('loanRate').value);
  let tenure = parseFloat(document.getElementById('loanTenure').value);
  const tenureType = document.getElementById('loanTenureType').value;
  const resultEl = document.getElementById('emiResult');

  if (isNaN(principal) || isNaN(annualRate) || isNaN(tenure) ||
      principal <= 0 || annualRate <= 0 || tenure <= 0) {
    resultEl.textContent = 'Please enter valid loan amount, rate and tenure.';
    return;
  }

  // convert tenure to months
  if (tenureType === 'years') {
    tenure = tenure * 12;
  }

  const monthlyRate = annualRate / 12 / 100; // annual % to monthly decimal [web:88][web:80]
  const n = tenure;

  // EMI formula
  const factor = Math.pow(1 + monthlyRate, n);
  const emi = principal * monthlyRate * factor / (factor - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal; 

  const text = `EMI: ₹${emi.toFixed(2)} | Total Interest: ₹${totalInterest.toFixed(2)} | Total Payment: ₹${totalPayment.toFixed(2)}`;

  resultEl.textContent = text;

  // Save to EMI history
  const previousCalc = currentCalcId;
  currentCalcId = 'emi';
  addToHistory(text);
  currentCalcId = previousCalc;
}
function appendValue(value) {
  // if there is Error, replace it
  if (display.value === 'Error') {
    display.value = '0';
  }
  resetIfZero();
  display.value += value;
}

function clearDisplay() {
  display.value = '0';
}

function backspace() {
  if (display.value === 'Error') {
    display.value = '0';
    return;
  }

  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = '0';
  }
}

function calculate() {
  try {
    const expression = display.value;
    const result = eval(expression);

    // add to history: "expression = result"
    addToHistory(`${expression} = ${result}`);

    display.value = result;
  } catch (error) {
    display.value = 'Error';
  }
}
// --- GPA CALCULATOR ---

// default letter to points map – S highest
const defaultGradePoints = {
  S: 5.0,
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0
};

const gpaCoursesDiv = document.getElementById('gpaCourses');

// add initial 3 rows when page loads
for (let i = 0; i < 3; i++) addCourseRow();

function addCourseRow() {
  const row = document.createElement('div');
  row.className = 'gpa-row';
  row.style.marginTop = '8px';

  row.innerHTML = `
    <input type="text" class="gpaGrade" placeholder="Grade (S/A/B/C/D/F or 4.5)" style="width: 55%; margin-right: 4px;" />
    <input type="number" class="gpaCredits" placeholder="Credits" style="width: 40%;" />
  `;

  gpaCoursesDiv.appendChild(row);
}

function gradeToPoints(gradeStr) {
  if (!gradeStr) return null;

  const trimmed = gradeStr.trim().toUpperCase();

  // numeric points
  const numeric = parseFloat(trimmed);
  if (!isNaN(numeric)) {
    return numeric;
  }

  // default letter mapping including S
  if (defaultGradePoints.hasOwnProperty(trimmed)) {
    return defaultGradePoints[trimmed];
  }

  return null;
}
function calculateGPA() {
  const gradeInputs = document.querySelectorAll('.gpaGrade');
  const creditInputs = document.querySelectorAll('.gpaCredits');
  const resultEl = document.getElementById('gpaResult');

  let totalPoints = 0;
  let totalCredits = 0;
  let validCourses = 0;

  for (let i = 0; i < gradeInputs.length; i++) {
    const gradeStr = gradeInputs[i].value;
    const credits = parseFloat(creditInputs[i].value);

    if (!gradeStr && !credits) continue; // skip empty row

    const points = gradeToPoints(gradeStr);

    if (points === null || isNaN(credits) || credits <= 0) {
      resultEl.textContent = 'Method 1: please enter valid grade and credits for each course.';
      return;
    }

    totalPoints += points * credits;
    totalCredits += credits;
    validCourses++;
  }

  if (validCourses === 0 || totalCredits === 0) {
    resultEl.textContent = 'Method 1: please enter at least one course.';
    return;
  }

  const gpa = totalPoints / totalCredits;

  const text = `Method 1 → GPA: ${gpa.toFixed(2)} (Total credits: ${totalCredits})`;
  resultEl.textContent = text;

  const prev = currentCalcId;
  currentCalcId = 'gpa';
  addToHistory(text);
  currentCalcId = prev;
}
function valOrDefaultNumber(inputId, defaultVal) {
  const v = parseFloat(document.getElementById(inputId).value);
  return isNaN(v) ? defaultVal : v;
}

function calculateGPAByCounts() {
  const resultEl = document.getElementById('gpaResult');

  // counts of each grade (if empty, treat as 0)
  const countS = parseFloat(document.getElementById('countS').value) || 0;
  const countA = parseFloat(document.getElementById('countA').value) || 0;
  const countB = parseFloat(document.getElementById('countB').value) || 0;
  const countC = parseFloat(document.getElementById('countC').value) || 0;
  const countD = parseFloat(document.getElementById('countD').value) || 0;
  const countF = parseFloat(document.getElementById('countF').value) || 0;

  const totalCourses = countS + countA + countB + countC + countD + countF;

  if (totalCourses === 0) {
    resultEl.textContent = 'Method 2: please enter at least one grade count.';
    return;
  }

  // credits per course for each grade.
  // If user leaves it empty, we use 1 credit per course as default.
  const creditS = valOrDefaultNumber('creditS', 1);
  const creditA = valOrDefaultNumber('creditA', 1);
  const creditB = valOrDefaultNumber('creditB', 1);
  const creditC = valOrDefaultNumber('creditC', 1);
  const creditD = valOrDefaultNumber('creditD', 1);
  const creditF = valOrDefaultNumber('creditF', 1);

  // grade points for each letter, from defaults
  const pS = defaultGradePoints.S; // 5
  const pA = defaultGradePoints.A; // 4
  const pB = defaultGradePoints.B; // 3
  const pC = defaultGradePoints.C; // 2
  const pD = defaultGradePoints.D; // 1
  const pF = defaultGradePoints.F; // 0

  // total points = sum(count * credits * points)
  const totalPoints =
    countS * creditS * pS +
    countA * creditA * pA +
    countB * creditB * pB +
    countC * creditC * pC +
    countD * creditD * pD +
    countF * creditF * pF;

  // total credits = sum(count * credits)
  const totalCredits =
    countS * creditS +
    countA * creditA +
    countB * creditB +
    countC * creditC +
    countD * creditD +
    countF * creditF;

  if (totalCredits === 0) {
    resultEl.textContent = 'Method 2: total credits cannot be 0.';
    return;
  }

  const gpa = totalPoints / totalCredits;

  const text = `Method 2 → GPA: ${gpa.toFixed(2)} (Total courses: ${totalCourses}, Total credits: ${totalCredits})`;
  resultEl.textContent = text;

  const prev = currentCalcId;
  currentCalcId = 'gpa';
  addToHistory(text);
  currentCalcId = prev;
}

// --- SIMPLE INTEREST CALCULATOR ---
function calculateSimpleInterest() {
  const principal = parseFloat(document.getElementById('siPrincipal').value);
  const rate = parseFloat(document.getElementById('siRate').value);
  const years = parseFloat(document.getElementById('siYears').value) || 0;
  const months = parseFloat(document.getElementById('siMonths').value) || 0;
  const days = parseFloat(document.getElementById('siDays').value) || 0;
  const resultEl = document.getElementById('siResult');

  if (isNaN(principal) || isNaN(rate) || principal <= 0 || rate <= 0) {
    resultEl.textContent = 'Please enter valid principal and rate.';
    return;
  }

  if (years === 0 && months === 0 && days === 0) {
    resultEl.textContent = 'Please enter time in years, months or days.';
    return;
  }

  // convert to years: months/12, days/365 [web:91]
  const timeYears = years + (months / 12) + (days / 365);

  const si = principal * (rate / 100) * timeYears;
  const total = principal + si;

  const text = `Simple Interest: ₹${si.toFixed(2)}, Total Amount: ₹${total.toFixed(2)} (Time ≈ ${timeYears.toFixed(3)} years)`;

  resultEl.textContent = text;

  const prev = currentCalcId;
  currentCalcId = 'interest';
  addToHistory(text);
  currentCalcId = prev;
}
// --- AGE CALCULATOR ---
function diffYMD(fromDate, toDate) {
  // ensure no time-of-day issues
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

function formatYMD(diff) {
  const parts = [];
  if (diff.years) parts.push(diff.years + (diff.years === 1 ? ' year' : ' years'));
  if (diff.months) parts.push(diff.months + (diff.months === 1 ? ' month' : ' months'));
  if (diff.days || parts.length === 0) parts.push(diff.days + (diff.days === 1 ? ' day' : ' days'));
  return parts.join(', ');
}

function calculateAgeRange() {
  const dobStr = document.getElementById('dob').value;
  const fromStr = document.getElementById('ageFrom').value;
  const toStr = document.getElementById('ageTo').value;

  const res1 = document.getElementById('ageResult1');
  const res2 = document.getElementById('ageResult2');

  if (!dobStr) {
    res1.textContent = 'Please select date of birth.';
    res2.textContent = '';
    return;
  }

  const dob = new Date(dobStr);
  const today = new Date();

  // default from/to
  const fromDate = fromStr ? new Date(fromStr) : dob;
  const toDate = toStr ? new Date(toStr) : today;

  if (toDate < fromDate) {
    res1.textContent = 'To date cannot be before from date.';
    res2.textContent = '';
    return;
  }

  // 1) total age from DOB to today (or toDate if user sets)
  const diffTotal = diffYMD(dob, toDate);
  const text1 = `Total age: ${formatYMD(diffTotal)}`;

  // 2) age from "from" to "to"
  const diffRange = diffYMD(fromDate, toDate);
  const text2 = `From ${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()} is ${formatYMD(diffRange)}`;

  res1.textContent = text1;
  res2.textContent = text2;

  const prev = currentCalcId;
  currentCalcId = 'age';
  addToHistory(text1);
  addToHistory(text2);
  currentCalcId = prev;
}
// --- TAX CALCULATOR (INDIA NEW REGIME - SIMPLE) ---
function calculateTax() {
  const income = parseFloat(document.getElementById('taxIncome').value);
  const taxOut = document.getElementById('taxOut');
  const rateOut = document.getElementById('taxEffectiveRate');

  taxOut.value = '';
  rateOut.value = '';

  if (isNaN(income) || income <= 0) {
    taxOut.value = 'Invalid income';
    return;
  }

  let tax = 0;
  let remaining = income;

  // Simple slab sample based on new regime style [web:98][web:103]
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ];

  let prevLimit = 0;
  for (const slab of slabs) {
    if (income > slab.limit) {
      const taxable = slab.limit - prevLimit;
      tax += taxable * slab.rate;
      prevLimit = slab.limit;
    } else {
      const taxable = income - prevLimit;
      if (taxable > 0) tax += taxable * slab.rate;
      break;
    }
  }

  const effectiveRate = (tax / income) * 100;

  taxOut.value = tax.toFixed(2);
  rateOut.value = effectiveRate.toFixed(2);

  const historyText = `Income=₹${income.toFixed(2)}, Tax=₹${tax.toFixed(2)}, Effective=${effectiveRate.toFixed(2)}%`;

  const prev = currentCalcId;
  currentCalcId = 'tax';
  addToHistory(historyText);
  currentCalcId = prev;
}
// --- STATISTICAL CALCULATOR ---

function parseNumbers(inputStr) {
  // split by comma or space, filter empty [web:99]
  return inputStr
    .split(/[\s,]+/)
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v));
}

function calculateStats() {
  const inputStr = document.getElementById('statsInput').value;
  const nums = parseNumbers(inputStr);

  const meanOut = document.getElementById('meanOut');
  const medianOut = document.getElementById('medianOut');
  const modeOut = document.getElementById('modeOut');
  const stdOut = document.getElementById('stdOut');

  meanOut.value = '';
  medianOut.value = '';
  modeOut.value = '';
  stdOut.value = '';

  if (!nums.length) {
    meanOut.value = 'No numbers';
    return;
  }

  // mean
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;

  // median
  const sorted = [...nums].sort((a, b) => a - b);
  let median;
  if (sorted.length % 2 === 0) {
    const mid1 = sorted[sorted.length / 2 - 1];
    const mid2 = sorted[sorted.length / 2];
    median = (mid1 + mid2) / 2;
  } else {
    median = sorted[(sorted.length - 1) / 2];
  }

  // mode (can be multiple)
  const freq = {};
  let maxFreq = 0;
  for (const n of nums) {
    freq[n] = (freq[n] || 0) + 1;
    if (freq[n] > maxFreq) maxFreq = freq[n];
  }
  const modes = Object.keys(freq)
    .filter(k => freq[k] === maxFreq)
    .map(k => Number(k));
  const modeStr = maxFreq === 1 ? 'No mode' : modes.join(', ');

  // standard deviation (population)
  const variance =
    nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
  const std = Math.sqrt(variance); 

  meanOut.value = mean.toFixed(3);
  medianOut.value = median.toFixed(3);
  modeOut.value = modeStr;
  stdOut.value = std.toFixed(3);

  const historyText =
    `Data=[${nums.join(', ')}], mean=${mean.toFixed(3)}, median=${median.toFixed(3)}, mode=${modeStr}, std=${std.toFixed(3)}`;

  const prev = currentCalcId;
  currentCalcId = 'statistical';
  addToHistory(historyText);
  currentCalcId = prev;
}
   // --- UNIT CONVERTER ---

const unitAmountInput = document.getElementById('unitAmount');
const unitCategorySelect = document.getElementById('unitCategory');
const unitFromSelect = document.getElementById('unitFrom');
const unitToSelect = document.getElementById('unitTo');
const unitResultInput = document.getElementById('unitResult');

// base units: meter, kilogram, litre
const unitDefinitions = {
  length: {
    base: 'm',
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      ft: 0.3048,
      in: 0.0254
    }
  },
  weight: {
    base: 'kg',
    units: {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.453592,
      oz: 0.0283495
    }
  },
  volume: {
    base: 'L',
    units: {
      L: 1,
      mL: 0.001,
      'm³': 1000,
      'ft³': 28.3168,
      gal: 3.78541    // US gallon
    }
  }
};

function updateUnitOptions() {
  const category = unitCategorySelect.value;
  const def = unitDefinitions[category];
  if (!def) return;

  unitFromSelect.innerHTML = '';
  unitToSelect.innerHTML = '';

  Object.keys(def.units).forEach(code => {
    const opt1 = document.createElement('option');
    opt1.value = code;
    opt1.textContent = code;
    unitFromSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = code;
    opt2.textContent = code;
    unitToSelect.appendChild(opt2);
  });

  // default different from/to
  const codes = Object.keys(def.units);
  if (codes.length >= 2) {
    unitFromSelect.value = codes[0];
    unitToSelect.value = codes[1];
  }
}

// initialize when page loads
if (unitCategorySelect) {
  updateUnitOptions();
}

function convertUnit() {
  const category = unitCategorySelect.value;
  const def = unitDefinitions[category];
  if (!def) return;

  const amount = parseFloat(unitAmountInput.value);
  const from = unitFromSelect.value;
  const to = unitToSelect.value;

  unitResultInput.value = '';

  if (isNaN(amount)) {
    unitResultInput.value = 'Invalid value';
    return;
  }

  if (from === to) {
    unitResultInput.value = amount.toString();
    return;
  }

  const fromFactor = def.units[from];
  const toFactor = def.units[to];

  if (fromFactor == null || toFactor == null) {
    unitResultInput.value = 'Unit not supported';
    return;
  }

  // convert: first to base unit, then to target
  const inBase = amount * fromFactor;
  const result = inBase / toFactor;

  unitResultInput.value = result.toFixed(4);

  const historyText =
    `${amount} ${from} → ${result.toFixed(4)} ${to} (${category})`;

  const prev = currentCalcId;
  currentCalcId = 'converter';
  addToHistory(historyText);
  currentCalcId = prev;
}
// --- SCIENTIFIC CALCULATOR ---

function insertSci(text) {
  const exprInput = document.getElementById('sciExpression');
  exprInput.value += text;
}

function clearSci() {
  document.getElementById('sciExpression').value = '0';
  document.getElementById('sciResult').value = '';
}

function calculateSci() {
  const exprInput = document.getElementById('sciExpression');
  const resultInput = document.getElementById('sciResult');
  const angleMode = document.getElementById('sciAngleMode').value;

  let expr = exprInput.value;
  resultInput.value = '';

  if (!expr.trim()) {
    resultInput.value = 'Enter expression';
    return;
  }

  try {
    // Replace custom tokens with Math.* and constants
    // handle power: a^b -> Math.pow(a,b)
    expr = expr.replace(/\^/g, '**'); // we will convert ** to Math.pow via eval transform

    // wrap sin/cos/tan to handle degrees if needed
    if (angleMode === 'deg') {
      expr = expr
        .replace(/sin\(/g, 'sinDeg(')
        .replace(/cos\(/g, 'cosDeg(')
        .replace(/tan\(/g, 'tanDeg(');
    }

    // convert log() and ln()
    expr = expr.replace(/log\(/g, 'log10(');
    expr = expr.replace(/ln\(/g, 'ln(');

    // constants
    expr = expr.replace(/pi/g, 'Math.PI');
    expr = expr.replace(/\be\b/g, 'Math.E');

    // prepare helper functions in an object so eval can use them
    const sinDeg = x => Math.sin((x * Math.PI) / 180);
    const cosDeg = x => Math.cos((x * Math.PI) / 180);
    const tanDeg = x => Math.tan((x * Math.PI) / 180);
    const log10 = x => Math.log10(x);
    const ln = x => Math.log(x);

    // transform ** into Math.pow(a,b) in a simple way:
    // note: for simple student usage, we can allow ** directly; modern JS supports it.
    // so we just let ** stand.
    const result = eval(expr); // uses Math functions and helpers [web:109][web:113][web:117]

    resultInput.value = result;

    const historyText = `${exprInput.value} = ${result}`;

    const prev = currentCalcId;
    currentCalcId = 'scientific';
    addToHistory(historyText);
    currentCalcId = prev;
  } catch (err) {
    resultInput.value = 'Error';
  }
}
// --- CONSTRUCTION CALCULATOR ---

function calculateConcrete() {
  const length = parseFloat(document.getElementById('conLength').value);
  const width = parseFloat(document.getElementById('conWidth').value);
  const thickness = parseFloat(document.getElementById('conThickness').value);

  const volOut = document.getElementById('conVolumeOut');
  const volYardOut = document.getElementById('conVolumeYardOut');
  const weightOut = document.getElementById('conWeightOut');

  volOut.value = '';
  volYardOut.value = '';
  weightOut.value = '';

  if (
    isNaN(length) || isNaN(width) || isNaN(thickness) ||
    length <= 0 || width <= 0 || thickness <= 0
  ) {
    volOut.value = 'Invalid input';
    return;
  }

  const volumeM3 = length * width * thickness;
  const volumeYd3 = volumeM3 / 0.764555; // 1 yd³ ≈ 0.7646 m³ [web:118]
  const density = 2400; // kg/m³ typical concrete density [web:114]
  const weightKg = volumeM3 * density;

  volOut.value = volumeM3.toFixed(3);
  volYardOut.value = volumeYd3.toFixed(3);
  weightOut.value = weightKg.toFixed(1);

  const historyText =
    `Concrete: L=${length}m, W=${width}m, T=${thickness}m, V=${volumeM3.toFixed(3)} m³, W≈${weightKg.toFixed(1)} kg`;

  const prev = currentCalcId;
  currentCalcId = 'construction';
  addToHistory(historyText);
  currentCalcId = prev;
}

function calculateArea() {
  const length = parseFloat(document.getElementById('areaLength').value);
  const width = parseFloat(document.getElementById('areaWidth').value);

  const sqmOut = document.getElementById('areaSqmOut');
  const sqydOut = document.getElementById('areaSqydOut');

  sqmOut.value = '';
  sqydOut.value = '';

  if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
    sqmOut.value = 'Invalid input';
    return;
  }

  const areaM2 = length * width;
  const areaYd2 = areaM2 * 1.19599; // 1 m² ≈ 1.196 yd² [web:118]

  sqmOut.value = areaM2.toFixed(3);
  sqydOut.value = areaYd2.toFixed(3);

  const historyText =
    `Area: L=${length}m, W=${width}m, A=${areaM2.toFixed(3)} m² (${areaYd2.toFixed(3)} yd²)`;

  const prev = currentCalcId;
  currentCalcId = 'construction';
  addToHistory(historyText);
  currentCalcId = prev;
}
// initial render of basic history (empty)
renderHistory();