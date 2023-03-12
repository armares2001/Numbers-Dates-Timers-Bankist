'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale
const locale = navigator.language;
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  weekday: 'long'
};

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-03-04T17:01:17.194Z',
    '2023-03-09T23:36:17.929Z',
    '2023-03-08T10:51:36.790Z'
  ],
  currency: 'EUR',
  locale: 'pt-PT' // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z'
  ],
  currency: 'USD',
  locale: 'en-US'
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const startLogOutTimer = (timerNow) => {
  let timer = 5 * 60;
  const updateTimer = setInterval(() => {
    timer--;
    const minutes = Math.trunc(timer / 60);
    const seconds = timer % 60;

    labelTimer.textContent = `${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}`;

    if (!timer) {
      clearInterval(updateTimer);
      clearInterval(timerNow);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;

      // Clear input fields
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();
    }
  }, 1 * 1000);

  return updateTimer;
};
const formatterNum = (num, options) => {
  return new Intl.NumberFormat(locale, options).format(num);
};
const calcDaysPassed = (date1, date2) => {
  return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
};

const formatMovementDate = (date) => {

  let displayDate = new Intl.DateTimeFormat(locale, options).format(date);

  const now = new Date();
  const daysPassed = calcDaysPassed(now, date);
  console.log(daysPassed);

  if (daysPassed < 7) displayDate = `${daysPassed} days ago`;
  if (daysPassed % 7 === 0 && daysPassed) displayDate = `${daysPassed / 7} weeks ago`;
  if (daysPassed > 100) displayDate = new Intl.DateTimeFormat(locale, options).format(date);
  if (daysPassed === 1) displayDate = 'Yesterday';
  if (!daysPassed) displayDate = 'Today';

  return displayDate;
};
const displayMovements = function(account, sort = false) {
  containerMovements.innerHTML = '';

  let movs = account.movements.map((mov, i) => {
    return [mov, account.movementsDates[i].slice()];
  });

  movs = sort ? movs.slice().sort((a, b) => a[0] - b[0]) : movs;

  movs.forEach(function(mov, i) {
    const type = mov[0] > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(mov[1]);
    const displayDate = formatMovementDate(date);

    const numberOptions = {
      style: 'currency',
      currency: 'EUR'
    };

    const formattedMov = formatterNum(mov[0], numberOptions);

    const html = `
      <div class='movements__row'>
        <div class='movements__type movements__type--${type}'>${
      i + 1
    } ${type}</div>
        <div class='movements__date'>${displayDate}</div>
        <div class='movements__value'>${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const numberOptions = {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  };

  const formattedMov = formatterNum(acc.balance, numberOptions);
  labelBalance.textContent = formattedMov;
};

const calcDisplaySummary = function(acc) {
  const numberOptions = {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  };

  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedIncome = formatterNum(income, numberOptions);
  labelSumIn.textContent = formattedIncome;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedOut = formatterNum(Math.abs(out), numberOptions);
  labelSumOut.textContent = formattedOut;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  const formattedInterest = formatterNum(interest, numberOptions);
  labelSumInterest.textContent = formattedInterest;
};

const createUsernames = function(accs) {
  accs.forEach(function(acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
const timeUpdate = function() {
  const now = new Date();
  labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
  // labelDate.textContent = `${now.getDate().toString().padStart(2, 0)}/${(
  //   now.getMonth() + 1
  // )
  //   .toString()
  //   .padStart(
  //     2,
  //     0
  //   )}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}`;
};
createUsernames(accounts);

const updateUI = function(acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer, nowTime;


const localeGeo = navigator.geolocation;
const testLocation = (geo) => {
  console.log(geo);
};
localeGeo.getCurrentPosition(testLocation);


// labelDate.textContent = `${now.getDate().toString().padStart(2, 0)}/${(
//   now.getMonth() + 1
// )
//   .toString()
//   .padStart(2, 0)}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}`;


btnLogin.addEventListener('click', function(e) {
  // Prevent form from submitting
  e.preventDefault();

  if (timer) {
    clearInterval(timer);
  }

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (nowTime) {
      clearInterval(nowTime);
    }

    const now = new Date();

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
    const timerNowIdInterval = setInterval(timeUpdate, 60000);

    const logoutIdInterval = startLogOutTimer(timerNowIdInterval);

    timer = logoutIdInterval;
    nowTime = timerNowIdInterval;

    // Update UI
    updateUI(currentAccount);
  } else if (currentAccount) timer = startLogOutTimer(nowTime);
});

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
  }

  clearInterval(timer);
  timer = startLogOutTimer(nowTime);
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    // Add movement
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 3 * 1000);

  }
  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = startLogOutTimer(nowTime);
});

btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  clearInterval(timer);

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  } else timer = startLogOutTimer(nowTime);

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
  clearInterval(timer);
  timer = startLogOutTimer(nowTime);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(Number.parseInt('2hello', 3));
console.log(+'2hello');
console.log(isFinite(23.3));
console.log(Number.isInteger(23.3));
console.log(
  Number.isSafeInteger(Number.MAX_SAFE_INTEGER),
  Number.MAX_SAFE_INTEGER
);
console.log(Math.trunc(-Math.random() * 20 + 1));

labelBalance.addEventListener('click', e => {
  [
    ...document.querySelectorAll('.movements__row').forEach((row, i) => {
      if (i % 2 === 0) row.style.backgroundColor = 'red';
    })
  ];
});
// console.log(15_00);
// console.log(1_500);
// console.log(BigInt(2 ** 83));

// const now = new Date(2001, 4, 14, 23, 58, 58);
// console.log(now);
// console.log(new Date(358 * 32 * 24 * 60 * 60 * 1000));


let _days = calcDaysPassed(new Date(2023, 5, 14, 22, 30), new Date(2023, 5, 6, 22, 30));
console.log(_days);

const num = 12345.6789;
console.log(num);

const numberOptions = {
  style: 'unit',
  unit: 'celsius'
};
console.log(new Intl.NumberFormat(locale, numberOptions).format(num));

const fTest = (...test) => {
  console.log(...test);
};
fTest(1, 2, 3, 4);