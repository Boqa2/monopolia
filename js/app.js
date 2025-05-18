// Refactored and cleaned up game logic

const car = document.querySelector(".car-content");
const cells = document.querySelectorAll(".cels");
const container = document.querySelector(".board");
const money = document.querySelectorAll(".money");
const bg = document.querySelector(".screen");

const forSpin = document.querySelector(".spin");
const forJeckpot = document.querySelector(".for-jeckpot");
const elms = document.querySelectorAll(".elm");
const chooseHome = document.querySelector(".choose-home");

const dice1 = document.querySelector(".dice1");
const dice2 = document.querySelector(".dice2");

const strelka = document.querySelector(".point-spin");
const textForSpin = document.querySelector("#text-for-spin");
const buttonForSpin = document.querySelector(".btn-spin");

const countLen = document.querySelector(".count-len");
const rolesButton = document.querySelector(".role-button");

const start = document.querySelector(".start");
const game = document.querySelector(".game");
const end = document.querySelector(".end");

let parentSpiner = document.querySelector(".spiner");
let shade = document.querySelector(".opacity-bg");
let forMoney = 0;
let parents = countLen.parentElement;
let parentDice = dice1.parentElement;
let parentBtn = rolesButton.parentElement;
let currentCellIndex = 9;

const positionRoll = {
  dise1: [
    { pos: "0deg", len: 5 },
    { pos: "120deg", len: 3 },
    { pos: "240deg", len: 6 },
  ],
  dise2: [
    { pos: "0deg", len: 3 },
    { pos: "120deg", len: 2 },
    { pos: "240deg", len: 6 },
  ],
};

const spinPos = [
  { pos: "0deg", action: { type: "number", value: 150 } },
  { pos: "50deg", action: { type: "path", value: "." } },
  { pos: "90deg", action: { type: "number", value: 50 } },
  { pos: "140deg", action: { type: "texts", value: true } },
  { pos: "180deg", action: { type: "number", value: 100 } },
  { pos: "270deg", action: { type: "number", value: 200 } },
];

let usedSpinIndices = new Set();

function getUniqueRandomSpinIndex() {
  if (usedSpinIndices.size === spinPos.length) usedSpinIndices.clear();

  let idx;
  do {
    idx = Math.floor(Math.random() * spinPos.length);
  } while (usedSpinIndices.has(idx));

  usedSpinIndices.add(idx);
  return idx;
}

function updateBalance(amount) {
  forMoney += amount;
  money.forEach((el) => (el.textContent = forMoney));
  if (forMoney <= 0) endGame();
}

const cellsArray = Array.from(cells).sort((a, b) =>
  Number(a.dataset.currentCells) - Number(b.dataset.currentCells)
);

cellsArray.forEach((cell) => {
  cell.addEventListener("carArrival", (e) => {
    const arrivedCell = e.detail.cell;
    console.log("Фишка прибыла на ячейку:", arrivedCell.dataset.currentCells);
  });
});

function getCellCenterPosition(cell) {
  const containerRect = container.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  return {
    left: cellRect.left - containerRect.left + cellRect.width / 2 - car.offsetWidth / 2,
    top: cellRect.top - containerRect.top + cellRect.height / 2 - car.offsetHeight / 2,
  };
}

function getDirection(cell) {
  const parent = cell.closest(".bottom, .left, .top, .rigth");
  if (!parent) return null;
  if (parent.classList.contains("bottom")) return "left";
  if (parent.classList.contains("left")) return "up";
  if (parent.classList.contains("top")) return "right";
  if (parent.classList.contains("rigth")) return "down";
  return null;
}

async function moveCar(steps) {
  for (let i = 0; i < steps; i++) {
    const currentCell = cellsArray[currentCellIndex];
    const nextCellIndex = (currentCellIndex + 1) % cellsArray.length;
    const nextCell = cellsArray[nextCellIndex];

    const currentDirection = getDirection(currentCell);
    const nextDirection = getDirection(nextCell);
    const nextPos = getCellCenterPosition(nextCell);

    if (currentDirection !== nextDirection) {
      car.style.left = `${nextPos.left}px`;
      car.style.top = `${nextPos.top}px`;
    } else {
      if (["left", "right"].includes(currentDirection)) car.style.left = `${nextPos.left}px`;
      else if (["up", "down"].includes(currentDirection)) car.style.top = `${nextPos.top}px`;
    }

    currentCellIndex = nextCellIndex;
    currentCell.dispatchEvent(new CustomEvent("carArrival", { detail: { cell: currentCell } }));

    if (cellsArray[currentCellIndex].classList.contains("first")) updateBalance(200);

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  const finalCell = cellsArray[currentCellIndex];
  if (finalCell.classList.contains("spin")) showSpin();
  if (finalCell.classList.contains("fourth")) {
    setTimeout(() => {
      const prisonCellIndex = cellsArray.findIndex((cell) => cell.dataset.currentCells === "11");
      if (prisonCellIndex !== -1) {
        const newPos = getCellCenterPosition(cellsArray[prisonCellIndex]);
        car.style.top = `${newPos.top}px`;
        car.style.left = `${newPos.left}px`;
        currentCellIndex = prisonCellIndex;
      }
      updateBalance(-200);
    }, 500);
  }
}

function rolControls() {
  parentBtn.classList.add("hidden");
  [dice1, dice2].forEach((el) => el.classList.add("role-animation"));

  setTimeout(() => {
    [dice1, dice2].forEach((el) => el.classList.remove("role-animation"));
    parents.classList.remove("hidden");
  }, 1200);

  const combos = [ [6, 2], [5, 3] ];
  const [val1, val2] = combos[Math.floor(Math.random() * combos.length)];
  const d1 = positionRoll.dise1.find((item) => item.len === val1);
  const d2 = positionRoll.dise2.find((item) => item.len === val2);

  dice1.style.transform = `rotate(${d1.pos})`;
  dice2.style.transform = `rotate(${d2.pos})`;

  const step = d1.len + d2.len;
  setTimeout(() => (countLen.textContent = step), 1000);
  setTimeout(() => {
    moveCar(step);
    setTimeout(() => {
      parentBtn.classList.remove("hidden");
      parents.classList.add("hidden");
    }, 3000);
  }, 2000);
}

function animateMoneyStepChange(newValue) {
  const step = newValue > forMoney ? 1 : -1;
  const className = step > 0 ? "animate-up" : "animate-down";
  const intervalId = setInterval(() => {
    if (forMoney === newValue) return clearInterval(intervalId);
    forMoney += step;
    money.forEach((el) => {
      el.textContent = forMoney;
      el.classList.add(className);
      setTimeout(() => el.classList.remove(className), 200);
    });
  }, 1);
}

function showSpin() {
  [parentBtn, parents, parentDice].forEach((el) => el.classList.add("hidden"));
  parentSpiner.classList.remove("hidden");
  shade.classList.remove("hidden");
}

function hiddenSpin() {
  [parentBtn, parents, parentDice].forEach((el) => el.classList.remove("hidden"));
  parentSpiner.classList.add("hidden");
  shade.classList.add("hidden");
}

function spinAnimation() {
  const randomIndex = getUniqueRandomSpinIndex();
  const selected = spinPos[randomIndex];
  const totalRotation = 5 * 360 + parseInt(selected.pos);

  strelka.style.transition = "none";
  strelka.style.transform = `rotate(0deg)`;
  setTimeout(() => {
    strelka.style.transition = "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    strelka.style.transform = `rotate(${totalRotation}deg)`;
  }, 50);

  strelka.addEventListener("transitionend", () => {
    const { type, value } = selected.action;
    if (type === "number") {
      minusBalans(value);
      hiddenSpin();
      textForSpin.classList.add("hidden");
      endGame(3000);
    } else if (type === "texts") {
      jackpot();
      hiddenSpin();
      endGame(6000);
    } else if (type === "path") {
      openPopup();
      hiddenSpin();
    }
  }, { once: true });

  textForSpin.classList.remove("hidden");
  buttonForSpin.classList.add("hidden");
  setTimeout(() => {
    parentSpiner.classList.add("hidden");
    strelka.style.transform = `rotate(0deg)`;
    hiddenSpin();
    bg.style.background = "url(../assets/GenerativeFill2.png) top/cover no-repeat";
  }, 10000);
}

function jackpot() {
  animateMoneyStepChange(forMoney + 1000);
  forJeckpot.classList.remove("hidden");
  Array.from(forJeckpot.children).forEach((el) => el.classList.add("animation-up"));
  setTimeout(() => forJeckpot.classList.add("hidden"), 3500);
}

function minusBalans(num) {
  animateMoneyStepChange(forMoney - num);
  bg.style.background = "url(../assets/Layer6.png) top/cover no-repeat";
  buttonForSpin.classList.add("hidden");
  textForSpin.textContent = "UH-ON!";
}

function openPopup() {
  chooseHome.classList.remove("hidden");
  buttonForSpin.classList.add("hidden");
  textForSpin.textContent = "Select 1 property";
}

function closePopup() {
  chooseHome.classList.add("hidden");
  buttonForSpin.classList.remove("hidden");
  textForSpin.textContent = "You haven't enouph money";
}

elms.forEach((elm) => {
  elm.addEventListener("click", () => {
    const price = parseInt(elm.dataset.price);
    if (forMoney >= price) {
      elms.forEach((e) => {
        const shade = e.querySelector(".bg-shade");
        if (shade) shade.style.opacity = "0.8";
      });
      const shade = elm.querySelector(".bg-shade");
      if (shade) shade.style.opacity = "0";
      animateMoneyStepChange(forMoney - price);
      chooseEnd();
    } else {
      alert("Недостаточно средств!");
      closePopup();
    }
  });
});

function startGame() {
  start.classList.add("hidden");
  game.classList.remove("hidden");
  end.classList.add("hidden");
}

function resetGame() {
  startGame();
  textForSpin.classList.add("hidden");
  parents.classList.add("hidden");
}

function endGame(interval = 1000) {
  setTimeout(() => {
    start.classList.add("hidden");
    game.classList.add("hidden");
    end.classList.remove("hidden");
    currentCellIndex = 9;
    car.style.left = "38px";
    car.style.top = "90%";
    textForSpin.classList.add("hidden");
    buttonForSpin.classList.remove("hidden");
    parents.classList.add("hidden");
  }, interval);
}

function chooseEnd() {
  chooseHome.classList.add("hidden");
  endGame(3000);
}

updateBalance(1500);
