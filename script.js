const canvas = document.querySelector("#space");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");

let width = 0;
let height = 0;
let particles = [];

function resize() {
  width = canvas.width = window.innerWidth * window.devicePixelRatio;
  height = canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  particles = Array.from({ length: Math.min(95, Math.floor(window.innerWidth / 16)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    r: Math.random() * 2 + 0.8
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 216, 255, .65)";
  ctx.strokeStyle = "rgba(0, 216, 255, .11)";
  particles.forEach((p, index) => {
    p.x += p.vx * window.devicePixelRatio;
    p.y += p.vy * window.devicePixelRatio;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();

    for (let i = index + 1; i < particles.length; i++) {
      const q = particles[i];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150 * window.devicePixelRatio) {
        ctx.globalAlpha = 1 - distance / (150 * window.devicePixelRatio);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });
  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
resize();
draw();

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".plan-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
    observeReveals();
  });
});

function observeReveals() {
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight - 80) {
      element.classList.add("visible");
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
observeReveals();

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.14}px)`;
  });
  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

document.querySelectorAll(".service-tile, .team-card, .plan-card, .category-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll("[data-count]").forEach((counter) => {
  const target = Number(counter.dataset.count);
  let current = 0;
  const step = () => {
    current += Math.max(1, Math.ceil(target / 30));
    counter.textContent = current >= target ? target : current;
    if (current < target) requestAnimationFrame(step);
  };
  step();
});

const currencySelect = document.querySelector("#currencySelect");
const fallbackRates = { USD: 1, INR: 95.40519, PKR: 278.244402 };
let exchangeRates = { ...fallbackRates };

function formatPrice(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0
  }).format(value);
}

function convertFromInr(amountInr, currency) {
  if (currency === "INR") return amountInr;
  const usdAmount = amountInr / exchangeRates.INR;
  return usdAmount * exchangeRates[currency];
}

function updatePrices(currency) {
  document.querySelectorAll("[data-inr]").forEach((price) => {
    const amountInr = Number(price.dataset.inr);
    const converted = convertFromInr(amountInr, currency);
    price.innerHTML = `${formatPrice(converted, currency)}<span>/mo</span>`;
  });
}

async function initCurrency() {
  if (!currencySelect) return;
  const savedCurrency = localStorage.getItem("axoCurrency") || "INR";
  currencySelect.value = savedCurrency;
  updatePrices(savedCurrency);

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    if (data && data.result === "success" && data.rates) {
      exchangeRates = {
        USD: 1,
        INR: data.rates.INR || fallbackRates.INR,
        PKR: data.rates.PKR || fallbackRates.PKR
      };
      updatePrices(currencySelect.value);
    }
  } catch (error) {
    updatePrices(currencySelect.value);
  }

  currencySelect.addEventListener("change", () => {
    localStorage.setItem("axoCurrency", currencySelect.value);
    updatePrices(currencySelect.value);
  });
}

initCurrency();
