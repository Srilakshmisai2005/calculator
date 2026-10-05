# Multi Calculator

A browser-based calculator app with 11 calculators in one page, built with HTML, CSS and plain JavaScript (no libraries, no install).

<!-- Add a screenshot here, for example: ![Scientific calculator](screenshot.png) -->

## Calculators

| Calculator | What it does |
| --- | --- |
| Basic | + - x /, backspace, clear. Keyboard works: digits, operators, Enter or =, Backspace, Esc |
| Scientific | sin, cos, tan (degrees or radians), log (base 10), ln, square root, x^y, pi, e |
| GPA | By course (letter grade or points, plus credits) or by number of courses per grade. Default scale: S=5, A=4, B=3, C=2, D=1, F=0 |
| BMI | Weight (kg) and height (cm), shows category |
| EMI / Loan | Monthly EMI, total interest and total payment |
| Tax | Example slab calculation in INR (see Limitations) |
| Statistical | Mean, median, mode and standard deviation of a list of numbers |
| Construction | Concrete volume and weight, and area |
| Unit converter | Length (m, km, cm, mm, ft, in), weight (kg, g, mg, lb, oz), volume (L, mL, gal) |
| Interest | Simple interest from years, months and days |
| Age | Age between two dates, in years, months and days |

Each calculator keeps its own history of up to 50 entries, with a Clear History button.

## Run it

1. Download or clone this repository.
2. Open `index.html` in a browser.

No build step or dependencies.

## Files

- `index.html` - page layout and calculator forms
- `style.css` - styling
- `script.js` - calculator logic and history

## Limitations

- The tax calculator uses a simple example slab table (0% up to 4,00,000, then 5%, 10%, 15%, 20%). It has no cess, rebate or deductions, so do not use it for real tax filing.
- Basic and scientific calculators evaluate typed expressions with JavaScript `eval()`. Fine for a personal project, but not for untrusted input.
- Results are rounded to 12 significant digits. Division by zero shows Infinity.
- Statistics uses population standard deviation.
- Concrete weight assumes a density of 2400 kg/m3.
- Tested by running the code in headless Chrome (desktop and phone-width layouts). Not tested on other browsers or on a hosted site.

## Ideas for next steps

Live demo with GitHub Pages, automated tests, a safer expression parser instead of `eval()`, dark mode, export history as CSV.
