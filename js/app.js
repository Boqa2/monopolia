const car = document.querySelector(".car");
const cells = document.querySelectorAll(".cels");
const container = document.querySelector(".board");
const money = document.querySelector(".money");
const bg = document.querySelector(".screen");

const forSpin = document.querySelector(".spin");
const for_jeckpot = document.querySelector(".for-jeckpot");
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
let parent = countLen.parentElement;
let parentDice = dice1.parentElement;
let parentBtn = rolesButton.parentElement;
let zIndex = null;

const positionRoll = {
  dise1: [
    {
      pos: "0deg",
      len: 5,
    },
    {
      pos: "120deg",
      len: 3,
    },
    {
      pos: "240deg",
      len: 6,
    },
  ],
  dise2: [
    {
      pos: "0deg",
      len: 3,
    },
    {
      pos: "120deg",
      len: 2,
    },
    {
      pos: "240deg",
      len: 6,
    },
  ],
};

function updateBalance(amount) {
  forMoney += amount;
  money.textContent = forMoney;

  if (forMoney <= 0) {
    endGame();
  }
}
const cellsArray = Array.from(cells).sort((a, b) => {
  return (
    Number(a.getAttribute("data-current-cells")) -
    Number(b.getAttribute("data-current-cells"))
  );
});

cellsArray.forEach((cell) => {
  cell.addEventListener("carArrival", (e) => {
    const arrivedCell = e.detail.cell;
    console.log(
      "Фишка прибыла на ячейку:",
      arrivedCell.getAttribute("data-current-cells")
    );
  });
});

function getCellCenterPosition(cell) {
  const containerRect = container.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  return {
    left:
      cellRect.left -
      containerRect.left +
      cellRect.width / 2 -
      car.offsetWidth / 2,
    top:
      cellRect.top -
      containerRect.top +
      cellRect.height / 2 -
      car.offsetHeight / 2,
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

let currentCellIndex = 0;

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
      if (currentDirection === "left" || currentDirection === "right") {
        car.style.left = `${nextPos.left}px`;
      } else if (currentDirection === "up" || currentDirection === "down") {
        car.style.top = `${nextPos.top}px`;
      }
    }

    currentCellIndex = nextCellIndex;

    const arrivalEvent = new CustomEvent("carArrival", {
      detail: { cell: currentCell },
    });
    currentCell.dispatchEvent(arrivalEvent);

    const startCell = cellsArray[currentCellIndex];
    if (startCell.classList.contains("first")) {
      updateBalance(200);
      money.textContent = forMoney;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const finalCell = cellsArray[currentCellIndex];
  if (finalCell.classList.contains("spin")) {
    showSpin();
  }
  const fourthCell = cellsArray[currentCellIndex];
  if (finalCell.classList.contains("fourth")) {
    setTimeout(() => {
      car.style.top = "90%";
      car.style.left = "0";
      updateBalance(-200);
      money.textContent = forMoney;
    });
  }
}

function rolControls() {
  parentBtn.classList.add("hidden");
  [dice1, dice2].forEach((el) => el.classList.add("role-animation"));

  setTimeout(() => {
    [dice1, dice2].forEach((el) => el.classList.remove("role-animation"));
    parent.classList.remove("hidden");
  }, 1200);

  const random1 =
    positionRoll.dise1[Math.floor(Math.random() * positionRoll.dise1.length)];
  const random2 =
    positionRoll.dise2[Math.floor(Math.random() * positionRoll.dise2.length)];

  dice1.style.transform = `rotate(${random1.pos})`;
  dice2.style.transform = `rotate(${random2.pos})`;
  let step = random1.len + random2.len;
  countLen.textContent = step;

  setTimeout(() => {
    moveCar(step);
    setTimeout(() => {
      parentBtn.classList.remove("hidden");
      parent.classList.add("hidden");
    }, 3000);
  }, 2000);
}

const spinPos = [
  { pos: "0deg", action: { type: "number", value: 150 } },
  { pos: "50deg", action: { type: "path", value: "." } },
  { pos: "90deg", action: { type: "number", value: 50 } },
  { pos: "140deg", action: { type: "texts", value: true } },
  { pos: "180deg", action: { type: "number", value: 100 } },
  { pos: "230deg", action: { type: "text", value: "jackpot" } },
  { pos: "270deg", action: { type: "number", value: 200 } },
  { pos: "320deg", action: { type: "free", value: "free house" } },
];

function showSpin() {
  parentBtn.classList.add("hidden");
  parent.classList.add("hidden");
  parentDice.classList.add("hidden");
  parentSpiner.classList.remove("hidden");
  shade.classList.remove("hidden");
}
function hiddenSpin() {
  parentBtn.classList.remove("hidden");
  parent.classList.remove("hidden");
  parentDice.classList.remove("hidden");
  parentSpiner.classList.add("hidden");
  shade.classList.add("hidden");
}

function spinAnimation() {
  const randomIndex = Math.floor(Math.random() * spinPos.length);
  const selected = spinPos[randomIndex];

  const baseRotations = 5;
  const targetDeg = parseInt(selected.pos);

  const totalRotation = baseRotations * 360 + targetDeg;

  strelka.style.transition = "none";
  strelka.style.transform = `rotate(0deg)`;

  setTimeout(() => {
    strelka.style.transition = "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    strelka.style.transform = `rotate(${totalRotation}deg)`;
  }, 50);

  strelka.addEventListener(
    "transitionend",
    () => {
      let does = selected.action.value;
      let types = selected.action.type;

      switch (types) {
        case "number":
          minusBalans(does);
          break;
        case "texts":
          jackpot();
          break;
        case "free":
          console.log();
          break;
        case "path":
          openPopup();
          break;
        default:
          console.log(undefined);
      }
    },
    { once: true }
  ); // { once: true } чтобы обработчик сработал только один раз

  textForSpin.classList.remove("hidden");
  buttonForSpin.classList.add("hidden");
  setTimeout(() => {
    parentSpiner.classList.add("hidden");
    strelka.style.transform = `rotate(0deg)`;
    hiddenSpin();
    bg.style.background =
      "url(../assets/GenerativeFill2.png) top/cover no-repeat";
  }, 10000);
}
function jackpot() {
  updateBalance(1000);
  money.textContent = forMoney;
  for_jeckpot.classList.remove("hidden");

  const arr = Array.from(for_jeckpot.children);

  arr.forEach((el) => {
    el.classList.add("animation-up");
  });

  setTimeout(() => {
    for_jeckpot.classList.add("hidden");
    arr.forEach((el) => {
      el.classList.add("animation-up");
    });
  }, 5999);
}
function minusBalans(num) {
  updateBalance(-num);
  money.textContent = forMoney;

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
    const price = parseInt(elm.getAttribute("data-price"));

    if (forMoney >= price) {
      elms.forEach((otherElm) => {
        const shade = otherElm.querySelector(".bg-shade");
        if (shade) shade.style.opacity = "0.8";
      });

      const currentShade = elm.querySelector(".bg-shade");
      if (currentShade) currentShade.style.opacity = "0";

      forMoney -= price;
      money.textContent = forMoney;
    } else {
      alert("Недостаточно средств!");
      closePopup();
    }
  });
});

function startGame() {
  start.classList.add("hidden");
  game.classList.remove("hidden");
  updateBalance(1500);
  end.classList.add("hidden");
}

function resetGame() {
  startGame()
}

function endGame() {
  start.classList.add("hidden");
  game.classList.add("hidden");
  end.classList.remove("hidden");
}