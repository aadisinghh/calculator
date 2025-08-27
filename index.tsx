/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const root = document.getElementById('root');

if (root) {
  // State variables
  let currentExpression = '0';
  let hasCalculated = false;

  // Create main calculator container
  const calculator = document.createElement('div');
  calculator.className = 'calculator';
  calculator.setAttribute('role', 'application');
  calculator.setAttribute('aria-roledescription', 'calculator');

  // Create About Button
  const aboutButton = document.createElement('button');
  aboutButton.className = 'btn-about';
  aboutButton.textContent = 'ⓘ';
  aboutButton.setAttribute('aria-label', 'About the developer');

  // Create the display screen
  const display = document.createElement('div');
  display.className = 'display';
  display.setAttribute('role', 'status');
  display.setAttribute('aria-live', 'polite');

  // Create the button grid
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'buttons';

  const buttonLayout = [
    { text: 'C', class: 'special', value: 'clear' },
    { text: '⌫', class: 'special', value: 'backspace' },
    { text: '%', class: 'special', value: '%' },
    { text: '÷', class: 'operator', value: '/' },
    { text: '7', class: 'number', value: '7' },
    { text: '8', class: 'number', value: '8' },
    { text: '9', class: 'number', value: '9' },
    { text: '×', class: 'operator', value: '*' },
    { text: '4', class: 'number', value: '4' },
    { text: '5', class: 'number', value: '5' },
    { text: '6', class: 'number', value: '6' },
    { text: '−', class: 'operator', value: '-' },
    { text: '1', class: 'number', value: '1' },
    { text: '2', class: 'number', value: '2' },
    { text: '3', class: 'number', value: '3' },
    { text: '+', class: 'operator', value: '+' },
    { text: '0', class: 'number span-2', value: '0' },
    { text: '.', class: 'number', value: '.' },
    { text: '=', class: 'operator', value: 'equals' },
  ];

  function getAriaLabel(text: string) {
    const labels: { [key: string]: string } = {
      'C': 'Clear',
      '⌫': 'Backspace',
      '%': 'Percent',
      '÷': 'Divide',
      '×': 'Multiply',
      '−': 'Subtract',
      '+': 'Add',
      '.': 'Decimal',
      '=': 'Equals',
    };
    return labels[text] || text;
  }

  buttonLayout.forEach(btnConfig => {
    const button = document.createElement('button');
    button.className = `btn ${btnConfig.class}`;
    button.textContent = btnConfig.text;
    button.dataset.value = btnConfig.value;
    button.setAttribute('aria-label', getAriaLabel(btnConfig.text));
    buttonsContainer.appendChild(button);
  });

  calculator.append(aboutButton, display, buttonsContainer);
  root.appendChild(calculator);

  // --- Theme Handling (System Default) ---
  const htmlEl = document.documentElement;

  function applySystemTheme(isDark: boolean) {
    if (isDark) {
      htmlEl.removeAttribute('data-theme');
    } else {
      htmlEl.setAttribute('data-theme', 'light');
    }
  }

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  applySystemTheme(darkModeMediaQuery.matches);
  
  darkModeMediaQuery.addEventListener('change', (e) => {
    applySystemTheme(e.matches);
  });

  // --- Modal Handling ---
  const aboutModal = document.getElementById('about-modal');
  const aboutOverlay = document.getElementById('about-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (aboutButton && aboutModal && aboutOverlay && closeModalBtn) {
    const openModal = () => {
      aboutModal.classList.remove('hidden');
      aboutOverlay.classList.remove('hidden');
    };

    const closeModal = () => {
      aboutModal.classList.add('hidden');
      aboutOverlay.classList.add('hidden');
    };

    aboutButton.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    aboutOverlay.addEventListener('click', closeModal);
  }

  // --- Event Handling ---
  buttonsContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    if (!target.matches('.btn')) return;

    const value = target.dataset.value;
    handleInput(value);
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key;
    let value = '';

    if (key >= '0' && key <= '9') value = key;
    else if (['+', '-', '*', '/', '%'].includes(key)) value = key;
    else if (key === '.') value = '.';
    else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevent form submission
        value = 'equals';
    }
    else if (key === 'Backspace') value = 'backspace';
    else if (key === 'Escape') value = 'clear';

    if (value) {
        const button = document.querySelector(`[data-value="${value}"]`) as HTMLButtonElement;
        if(button) {
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 100);
        }
        handleInput(value);
    }
  });

  function handleInput(value: string | undefined) {
    if (!value) return;

    switch (value) {
      case 'clear':
        clear();
        break;
      case 'backspace':
        backspace();
        break;
      case 'equals':
        calculate();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        handleOperator(value);
        break;
      case '.':
        handleDecimal();
        break;
      default: // Numbers
        handleNumber(value);
        break;
    }
    updateDisplay();
  }

  function updateDisplay() {
    display.textContent = currentExpression;
    // Dynamic font size
    const maxLength = 9;
    if (currentExpression.length > maxLength) {
        const newSize = Math.max(1.5, 3 - (currentExpression.length - maxLength) * 0.15);
        display.style.fontSize = `${newSize}rem`;
    } else {
        display.style.fontSize = '3rem';
    }
  }

  function clear() {
    currentExpression = '0';
    hasCalculated = false;
  }

  function backspace() {
    if (hasCalculated) {
        clear();
        return;
    }
    currentExpression = currentExpression.slice(0, -1);
    if (currentExpression === '') {
      currentExpression = '0';
    }
  }

  function handleNumber(value: string) {
    if (currentExpression === '0' || hasCalculated) {
      currentExpression = value;
      hasCalculated = false;
    } else {
      currentExpression += value;
    }
  }

  function handleOperator(value: string) {
    hasCalculated = false;
    const lastChar = currentExpression.slice(-1);
    const operators = ['+', '*', '/', '%'];

    // If last char is an operator (and not a minus sign for a negative number)
    if (operators.includes(lastChar) || (lastChar === '-' && currentExpression.length > 1)) {
        // Allow for negative numbers like 5 * -2
        if (value === '-' && lastChar !== ' ' && !currentExpression.endsWith('-')) {
            currentExpression += value;
        } else {
            // Replace the last operator
            currentExpression = currentExpression.slice(0, -1) + value;
        }
    } else {
      currentExpression += value;
    }
  }

  function handleDecimal() {
    if (hasCalculated) {
        currentExpression = '0.';
        hasCalculated = false;
        return;
    }

    const operators = /[\+\-\*\/%]/;
    const numbers = currentExpression.split(operators);
    const lastNumber = numbers[numbers.length - 1];

    if (!lastNumber.includes('.')) {
      currentExpression += '.';
    }
  }

  function calculate() {
    try {
        let expressionToEval = currentExpression;
        
        const lastChar = expressionToEval.slice(-1);
        if (['+', '-', '*', '/', '%', '.'].includes(lastChar)) {
            expressionToEval = expressionToEval.slice(0, -1);
        }

        expressionToEval = expressionToEval.replace(/(\d*\.?\d+)([\+\-\*\/])(\d*\.?\d+)%/g, (match, p1, p2, p3) => {
            return `${p1} ${p2} (${p1} * ${p3 / 100})`;
        });

        expressionToEval = expressionToEval.replace(/(\d*\.?\d+)%/g, '($1/100)');
        
        if(expressionToEval.includes('%')) {
          throw new Error('Invalid percentage usage');
        }

        const result = new Function(`return ${expressionToEval}`)();

        if (!isFinite(result)) {
            throw new Error('Division by zero');
        }

        currentExpression = String(parseFloat(result.toPrecision(15)));
        hasCalculated = true;

    } catch (error) {
        currentExpression = 'Error';
        hasCalculated = true;
    }
  }
  
  updateDisplay();
}
