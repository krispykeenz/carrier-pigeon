// DEMO MODE ONLY: Static showcase with mocked messages.
// Remove the /demo folder when publishing a real deployment.

const state = {
  messages: [],
  nextId: 1,
  ticking: false,
};

const els = {
  toInput: document.getElementById('toInput'),
  msgInput: document.getElementById('msgInput'),
  speedSelect: document.getElementById('speedSelect'),
  sendBtn: document.getElementById('sendBtn'),
  sendHint: document.getElementById('sendHint'),
  outbox: document.getElementById('outbox'),
};

function nowIso() {
  return new Date().toISOString();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function estimateSeconds(speedKph) {
  // Demo: random “distance” and a little padding.
  const distanceKm = 120 + Math.floor(Math.random() * 2400);
  const hours = distanceKm / speedKph;
  const seconds = Math.round(hours * 12) + 6; // scaled down for a quick demo
  return clamp(seconds, 8, 45);
}

function send() {
  const to = els.toInput.value.trim() || 'Alex';
  const body = els.msgInput.value.trim() || 'Hello from the pigeon post!';
  const speedKph = Number(els.speedSelect.value);

  const totalSeconds = estimateSeconds(speedKph);
  const id = `msg_${state.nextId++}`;

  state.messages.unshift({
    id,
    to,
    body,
    speedKph,
    createdAt: nowIso(),
    progress: 0,
    totalSeconds,
    status: 'in_flight',
  });

  els.toInput.value = '';
  els.msgInput.value = '';

  els.sendHint.textContent = `Pigeon dispatched to ${to}. ETA ~${totalSeconds}s (demo time).`;
  render();
  startTicking();
}

function startTicking() {
  if (state.ticking) return;
  state.ticking = true;

  const tick = () => {
    let anyInFlight = false;

    for (const m of state.messages) {
      if (m.status !== 'in_flight') continue;
      anyInFlight = true;
      m.progress = clamp(m.progress + 1 / m.totalSeconds, 0, 1);
      if (m.progress >= 1) m.status = 'delivered';
    }

    render();

    if (anyInFlight) {
      setTimeout(tick, 1000);
    } else {
      state.ticking = false;
    }
  };

  setTimeout(tick, 650);
}

function pill(text) {
  return `<span class="pill">${text}</span>`;
}

function render() {
  els.outbox.innerHTML = '';

  if (!state.messages.length) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No messages yet — send a pigeon from the form.';
    els.outbox.appendChild(empty);
    return;
  }

  for (const m of state.messages) {
    const item = document.createElement('div');
    item.className = 'cart-item';

    const pct = Math.round(m.progress * 100);
    const status = m.status === 'delivered' ? 'Delivered' : `In flight • ${pct}%`;

    item.innerHTML = `
      <div>
        <div class="name">To: ${m.to}</div>
        <div class="line">${m.body}</div>
        <div class="line">Speed: ${m.speedKph} km/h • ${status}</div>
        <div style="height:.5rem"></div>
        <div style="height:10px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12)">
          <div style="height:10px;width:${pct}%;background:linear-gradient(45deg,#ff6b6b,#feca57)"></div>
        </div>
      </div>
      <div>${pill(m.status === 'delivered' ? '✓' : '🕊️')}</div>
    `;

    els.outbox.appendChild(item);
  }
}

els.sendBtn.addEventListener('click', send);
render();
