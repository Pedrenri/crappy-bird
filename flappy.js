function createElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barrier(reverse = false) {
  this.elemento = createElement("div", "barreira");

  const border = createElement("div", "borda");
  const body = createElement("div", "corpo");

  this.elemento.appendChild(reverse ? body : border);
  this.elemento.appendChild(reverse ? border : body);

  this.setHeight = (height) => (body.style.height = `${height}px`);
}

// TESTE

/* const b = new Barreira(true)
b.setHeight(300)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */

function DoubleBarrier(height, aperture, x) {
  this.elemento = createElement("div", "par-barreiras");

  this.upper = new Barrier(true);
  this.lower = new Barrier(false);

  this.elemento.appendChild(this.upper.elemento);
  this.elemento.appendChild(this.lower.elemento);

  this.sortOpening = () => {
    const upperH = Math.random() * (height - aperture);
    const lowerH = height - aperture - upperH;

    this.upper.setHeight(upperH);
    this.lower.setHeight(lowerH);
  };

  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
  this.setX = (x) => (this.elemento.style.left = `${x}px`);
  this.getW = () => this.elemento.clientWidth;

  this.sortOpening();
  this.setX(x);
}

// TESTE

/* const b = new DoubleBarrier(700,200,400)
document.querySelector('[wm-flappy]').appendChild(b.elemento) */

function Barriers(height, width, opening, spacing, checkPoint) {
  this.pares = [
    new DoubleBarrier(height, opening, width),
    new DoubleBarrier(height, opening, width + spacing),
    new DoubleBarrier(height, opening, width + spacing * 2),
    new DoubleBarrier(height, opening, width + spacing * 3),
  ];

  const movement = 3;
  this.animate = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - movement);

      if (par.getX() < -par.getW()) {
        par.setX(par.getX() + spacing * this.pares.length);
        par.sortOpening();
      }

      const mid = width / 2;
      const crossedMid = par.getX() + movement >= mid && par.getX() < mid;
      if (crossedMid) checkPoint();
    });
  };
}

function Bird(gameH) {
  let flying = false;

  this.elemento = createElement("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  document.addEventListener("keydown", function (event) {
    if (event.keyCode == 32) {
      flying = true;
    }
  });
  document.addEventListener("keyup", function (event) {
    if (event.keyCode == 32) {
      flying = false;
    }
  });

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxH = gameH - this.elemento.clientHeight;

    if (newY <= 0) this.setY(0);
    else if (newY >= maxH) this.setY(maxH);
    else this.setY(newY);
  };

  this.setY(gameH / 2);
}

function Progress() {
  this.elemento = createElement("span", "progresso");
  this.setPoint = (points) => {
    this.elemento.innerHTML = points;
  };

  this.setPoint(0);
}

function collider(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function hasCollided(bird, barriers) {
  let collided = false;

  barriers.pares.forEach((DoubleBarrier) => {
    if (!collided) {
      const sup = DoubleBarrier.upper.elemento;
      const inf = DoubleBarrier.lower.elemento;

      collided = collider(bird.elemento, inf) || collider(bird.elemento, sup);
    }
  });
  return collided;
}

function CrappyBird() {
  let points = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const H = gameArea.clientHeight;
  const W = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(H, W, 200, 400, () =>
    progress.setPoint(++points)
  );

  const bird = new Bird(H);

  gameArea.appendChild(progress.elemento);
  gameArea.appendChild(bird.elemento);
  barriers.pares.forEach((par) => gameArea.appendChild(par.elemento));

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate();

      if (hasCollided(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

const game = new CrappyBird();

game.start()