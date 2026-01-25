// Simple single-page navigation
(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const pages = Array.from(document.querySelectorAll('.page'));

  function activatePage(hash) {
    const targetId = hash || '#overview';
    pages.forEach(p => {
      p.classList.toggle('page-active', `#${p.id}` === targetId);
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === targetId);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.getAttribute('href');
      window.location.hash = target;
      activatePage(target);
    });
  });

  // CTA buttons in hero
  document.querySelectorAll('.btn[data-target]').forEach(btn => {
    btn.addEventListener('click', e => {
      const target = e.currentTarget.getAttribute('data-target');
      window.location.hash = target;
      activatePage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // initial
  activatePage(window.location.hash || '#overview');
  window.addEventListener('hashchange', () => activatePage(window.location.hash));
})();

// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
})();

// How It Works Phase Logic
(function () {
  const phaseItems = Array.from(document.querySelectorAll('.phase-item'));
  const label = document.getElementById('phase-label');
  const diagram = document.getElementById('how-diagram');
  let playInterval = null;
  const phaseOrder = ['intake', 'compression', 'combustion', 'exhaust'];

  function setPhase(phase) {
    phaseItems.forEach(item => {
      item.classList.toggle('active', item.dataset.phase === phase);
    });
    if (label) {
      label.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
    }
    if (diagram) {
      diagram.dataset.phase = phase;
    }
  }

  phaseItems.forEach(item => {
    item.addEventListener('click', () => {
      const phase = item.dataset.phase;
      setPhase(phase);
    });
  });

  const playBtn = document.getElementById('play-cycle');
  const pauseBtn = document.getElementById('pause-cycle');

  function nextPhase() {
    const current = phaseItems.find(p => p.classList.contains('active')) || phaseItems[0];
    const idx = phaseOrder.indexOf(current.dataset.phase);
    const next = phaseOrder[(idx + 1) % phaseOrder.length];
    setPhase(next);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (playInterval) return;
      playInterval = setInterval(nextPhase, 1000);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
      }
    });
  }
})();

// Simulation model (simplified, pure JS)
(function () {
  // Elements
  const boostSlider = document.getElementById('boost');
  const boostInput = document.getElementById('boost-input');
  const afrSlider = document.getElementById('afr');
  const afrOutput = document.getElementById('afr-output');
  const timingSlider = document.getElementById('timing-deg');
  const timingOutput = document.getElementById('timing-output');
  const rpmSlider = document.getElementById('rpm');
  const rpmOutput = document.getElementById('rpm-output');
  const rpmBadge = document.getElementById('rpm-badge-label');
  const sealSelect = document.getElementById('seal-type');
  const presetRadios = Array.from(document.querySelectorAll('input[name="preset"]'));
  const presetDescription = document.getElementById('preset-description');

  const wearMeter = document.getElementById('wear-meter');
  const heatMeter = document.getElementById('heat-meter');
  const wearIndexEl = document.getElementById('wear-index');
  const heatIndexEl = document.getElementById('heat-index');
  const wearLabel = document.getElementById('wear-label');
  const heatLabel = document.getElementById('heat-label');
  const riskBadge = document.getElementById('risk-badge');
  const riskLabel = document.getElementById('risk-label');
  const riskDetail = document.getElementById('risk-detail');
  const detonationTendency = document.getElementById('detonation-tendency');
  const riskSummary = document.getElementById('risk-summary');

  const disclaimerToggle = document.querySelector('.disclaimer-toggle');
  const disclaimerDetails = document.querySelector('.disclaimer-details');

  const helpToggle = document.querySelector('.help-toggle');
  const helpContent = document.querySelector('.help-content');

  const timingPresets = Array.from(document.querySelectorAll('#timing-presets input[name="timing"]'));

  if (!boostSlider) return; // nothing to do if simulation UI missing

  // Helpers
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function formatRpm(value) {
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // Preset handling
  const presetConfigs = {
    stock: {
      boost: 0,
      afr: 12.5,
      timing: 0,
      rpm: 3000,
      seal: 'stock',
      description: 'Stock street: low or no boost, near‑stock AFR and timing, aimed at long life.'
    },
    mild: {
      boost: 7,
      afr: 11.8,
      timing: 2,
      rpm: 5500,
      seal: 'performance',
      description: 'Mild street port: moderate boost, slightly advanced timing, for spirited driving.'
    },
    track: {
      boost: 14,
      afr: 11.2,
      timing: 3,
      rpm: 7500,
      seal: 'race',
      description: 'Track/Drift: higher boost and RPM; high wear and heat risk if not managed carefully.'
    }
  };

  function applyPreset(presetKey) {
    const cfg = presetConfigs[presetKey];
    if (!cfg) return;
    boostSlider.value = cfg.boost;
    boostInput.value = cfg.boost;
    afrSlider.value = cfg.afr;
    timingSlider.value = cfg.timing;
    rpmSlider.value = cfg.rpm;
    sealSelect.value = cfg.seal;
    presetDescription.textContent = cfg.description;
    syncOutputs();
    runSimulation();
  }

  presetRadios.forEach(r => {
    r.addEventListener('change', e => {
      if (e.target.checked) {
        applyPreset(e.target.value);
      }
    });
  });

  // Sync controls
  function syncOutputs() {
    const boost = Number(boostSlider.value);
    boostInput.value = boost;
    const afr = Number(afrSlider.value);
    afrOutput.textContent = afr.toFixed(1) + ':1';
    const timing = Number(timingSlider.value);
    timingOutput.textContent = timing.toFixed(0) + '°';
    const rpm = Number(rpmSlider.value);
    const rpmText = formatRpm(rpm) + ' rpm';
    rpmOutput.textContent = rpmText;
    if (rpmBadge) rpmBadge.textContent = rpmText;

    // Sync timing pills
    let matched = false;
    timingPresets.forEach(p => {
      p.checked = Number(p.value) === timing;
      if (p.checked) matched = true;
    });
    if (!matched) {
      timingPresets.forEach(p => { p.checked = false; });
    }
  }

  // Input events
  boostSlider.addEventListener('input', () => {
    boostInput.value = boostSlider.value;
    runSimulation();
  });
  boostInput.addEventListener('change', () => {
    const val = clamp(Number(boostInput.value) || 0, 0, 25);
    boostInput.value = val;
    boostSlider.value = val;
    runSimulation();
  });

  afrSlider.addEventListener('input', () => {
    afrOutput.textContent = Number(afrSlider.value).toFixed(1) + ':1';
    runSimulation();
  });

  timingSlider.addEventListener('input', () => {
    timingOutput.textContent = Number(timingSlider.value).toFixed(0) + '°';
    // Detach preset selection if non-matching
    syncOutputs();
    runSimulation();
  });

  timingPresets.forEach(p => {
    p.addEventListener('change', e => {
      if (e.target.checked) {
        timingSlider.value = e.target.value;
        timingOutput.textContent = Number(e.target.value).toFixed(0) + '°';
        runSimulation();
      }
    });
  });

  rpmSlider.addEventListener('input', () => {
    const rpm = Number(rpmSlider.value);
    const txt = formatRpm(rpm) + ' rpm';
    rpmOutput.textContent = txt;
    if (rpmBadge) rpmBadge.textContent = txt;
    runSimulation();
  });

  sealSelect.addEventListener('change', runSimulation);

  // Disclaimer toggle
  if (disclaimerToggle && disclaimerDetails) {
    disclaimerToggle.addEventListener('click', () => {
      const expanded = disclaimerToggle.getAttribute('aria-expanded') === 'true';
      disclaimerToggle.setAttribute('aria-expanded', String(!expanded));
      disclaimerDetails.hidden = expanded;
    });
  }

  // Help toggle
  if (helpToggle && helpContent) {
    helpToggle.addEventListener('click', () => {
      const expanded = helpToggle.getAttribute('aria-expanded') === 'true';
      helpToggle.setAttribute('aria-expanded', String(!expanded));
      helpContent.hidden = expanded;
    });
  }

  // Core simplified simulation model
  function computeSimulation() {
    const boost = Number(boostSlider.value);   // 0–25 psi
    const afr = Number(afrSlider.value);       // 10–16
    const timing = Number(timingSlider.value); // -5–5 deg
    const rpm = Number(rpmSlider.value);       // 500–9000
    const seal = sealSelect.value;

    // Normalize rpm (0 at 500, 1 at 9000)
    const rpmNorm = (rpm - 500) / (9000 - 500);
    const rpmClamped = clamp(rpmNorm, 0, 1);

    // Boost factor 0–1 (0–25 psi)
    const boostNorm = clamp(boost / 25, 0, 1);

    // Seal durability factor: lower means wears faster
    let sealFactor;
    switch (seal) {
      case 'performance':
        sealFactor = 0.9;
        break;
      case 'race':
        sealFactor = 0.8;
        break;
      default: // stock
        sealFactor = 1.0;
    }

    // Wear index: base from rpm and boost, mitigated by stronger seals
    let wearIndex = 0.35 * rpmClamped + 0.5 * boostNorm;
    wearIndex /= sealFactor;
    wearIndex = clamp(wearIndex, 0, 1);

    // Heat index
    const afrRichPenalty = Math.max(0, 11 - afr) / 3; // too rich
    const afrLeanPenalty = Math.max(0, afr - 12.5) / 3; // too lean
    const afrPenalty = afrRichPenalty + afrLeanPenalty;
    let heatIndex = 0.4 * rpmClamped + 0.4 * boostNorm + 0.2 * afrPenalty;
    heatIndex = clamp(heatIndex, 0, 1);

    // Detonation tendency index
    const leanFactor = Math.max(0, afr - 11.5) / 4.5; // from ~11.5 to 16
    const timingFactor = (timing + 5) / 10; // -5..5 -> 0..1
    let detIndex = 0.45 * boostNorm + 0.25 * rpmClamped + 0.2 * leanFactor + 0.1 * timingFactor;
    detIndex = clamp(detIndex, 0, 1);

    // Combined risk
    const combined = (wearIndex + heatIndex + detIndex) / 3;

    let riskCategory, riskText, badgeClass;
    if (combined < 0.33 && detIndex < 0.4 && heatIndex < 0.5) {
      riskCategory = 'Safe';
      riskText = 'Low combined risk';
      badgeClass = '';
    } else if (combined < 0.7 && detIndex < 0.8) {
      riskCategory = 'Aggressive';
      riskText = 'Requires careful monitoring';
      badgeClass = 'aggressive';
    } else {
      riskCategory = 'Engine‑grenade';
      riskText = 'Severe risk – avoid in real engines';
      badgeClass = 'danger';
    }

    let detLabel;
    if (detIndex < 0.33) detLabel = 'Low';
    else if (detIndex < 0.66) detLabel = 'Moderate';
    else detLabel = 'Severe';

    let wearLabelText;
    if (wearIndex < 0.33) wearLabelText = 'Low';
    else if (wearIndex < 0.66) wearLabelText = 'Moderate';
    else wearLabelText = 'High';

    let heatLabelText;
    if (heatIndex < 0.33) heatLabelText = 'Cool';
    else if (heatIndex < 0.66) heatLabelText = 'Warm';
    else heatLabelText = 'Hot';

    return {
      inputs: { boost, afr, timing, rpm, seal },
      indices: { wearIndex, heatIndex, detIndex, combined },
      labels: { riskCategory, riskText, wearLabelText, heatLabelText, detLabel, badgeClass }
    };
  }

  function renderSimulation(result) {
    const { inputs, indices, labels } = result;
    if (wearMeter) wearMeter.style.width = (indices.wearIndex * 100).toFixed(0) + '%';
    if (heatMeter) heatMeter.style.width = (indices.heatIndex * 100).toFixed(0) + '%';

    wearIndexEl.textContent = indices.wearIndex.toFixed(2);
    heatIndexEl.textContent = indices.heatIndex.toFixed(2);
    wearLabel.textContent = labels.wearLabelText;
    heatLabel.textContent = labels.heatLabelText;

    riskBadge.classList.remove('aggressive', 'danger');
    if (labels.badgeClass) {
      riskBadge.classList.add(labels.badgeClass);
    }
    riskLabel.textContent = labels.riskCategory;
    riskDetail.textContent = labels.riskText;
    detonationTendency.textContent = 'Detonation tendency: ' + labels.detLabel;

    // Risk summary
    const lines = [];
    const { boost, afr, timing, rpm, seal } = inputs;

    lines.push(`Current settings: ~${formatRpm(rpm)} rpm, ${boost.toFixed(1)} psi, AFR ${afr.toFixed(1)}:1, timing ${timing.toFixed(0)}° from stock, ${seal} seals.`);

    const bullets = [];

    if (boost > 0) {
      bullets.push(`Boost of ${boost.toFixed(1)} psi increases load on seals and heat in the rotor housings.`);
    } else {
      bullets.push('Naturally aspirated (0 psi) keeps pressure‑related stress relatively low.');
    }

    if (afr < 11) {
      bullets.push(`AFR of ${afr.toFixed(1)}:1 is very rich, which can cool combustion but wash oil from seals.`);
    } else if (afr > 13) {
      bullets.push(`AFR of ${afr.toFixed(1)}:1 is fairly lean, raising combustion temperature and knock tendency.`);
    } else {
      bullets.push(`AFR of ${afr.toFixed(1)}:1 is in a broadly safer range for many boosted setups.`);
    }

    if (timing > 0) {
      bullets.push(`Advanced timing (${timing.toFixed(0)}°) increases cylinder pressure earlier and raises knock risk.`);
    } else if (timing < 0) {
      bullets.push(`Retarded timing (${timing.toFixed(0)}°) can reduce knock risk but may overheat exhaust temperatures.`);
    } else {
      bullets.push('Stock‑like timing balances response and risk for typical street use.');
    }

    if (rpm > 7000) {
      bullets.push(`High RPM (${formatRpm(rpm)}) creates strong centrifugal loads and accelerates wear.`);
    } else if (rpm < 2000) {
      bullets.push(`Lower RPM (${formatRpm(rpm)}) reduces mechanical stress but may not reflect spirited driving.`);
    }

    if (labels.riskCategory === 'Engine‑grenade') {
      bullets.push('This combination would be extremely risky in a real 13B without expert tuning and robust hardware.');
    } else if (labels.riskCategory === 'Aggressive') {
      bullets.push('These settings resemble aggressive street or track use; safety margin is reduced.');
    } else {
      bullets.push('Overall, these trends look relatively gentle, assuming healthy hardware and cooling.');
    }

    riskSummary.innerHTML = `
      <p><strong>${labels.riskCategory}:</strong> ${labels.riskText}</p>
      <p>${lines[0]}</p>
      <ul>${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    `;
  }

  function runSimulation() {
    const result = computeSimulation();
    renderSimulation(result);
    updateVisualizerHeat(result.indices.heatIndex);
  }

  // Visualizer animation
  const visRotor = document.querySelector('.visual-rotor');
  const visChambers = Array.from(document.querySelectorAll('.visual-chamber'));
  const phaseTag = document.getElementById('visual-phase-tag');

  const phases = ['Intake', 'Compression', 'Combustion', 'Exhaust'];
  let currentPhaseIndex = 0;
  let visInterval = null;

  function updateVisualizerHeat(heatIndex) {
    const base = 1 - 0.4 * heatIndex;
    const bg = `radial-gradient(circle at 20% 20%, rgba(224, 242, 255, ${base}), rgba(248, 250, 252, ${0.8 -
      0.3 * heatIndex}))`;
    const vis = document.getElementById('engine-visualizer');
    if (vis) vis.style.backgroundImage = bg;
  }

  function stepPhase() {
    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    if (phaseTag) phaseTag.textContent = phases[currentPhaseIndex];

    visChambers.forEach((ch, idx) => {
      ch.style.opacity = idx === currentPhaseIndex ? '0.9' : '0.4';
    });
  }

  function startVisualizer() {
    if (visInterval) return;
    const rpm = Number(rpmSlider.value);
    const rpmNorm = (rpm - 500) / (9000 - 500);
    const period = 2000 - 1500 * clamp(rpmNorm, 0, 1); // 2s down to 0.5s
    visInterval = setInterval(stepPhase, Math.max(400, period));
  }

  function stopVisualizer() {
    if (visInterval) {
      clearInterval(visInterval);
      visInterval = null;
    }
  }

  const playBtn = document.getElementById('vis-play');
  const pauseBtn = document.getElementById('vis-pause');
  const stepBtn = document.getElementById('vis-step');

  if (playBtn) playBtn.addEventListener('click', startVisualizer);
  if (pauseBtn) pauseBtn.addEventListener('click', stopVisualizer);
  if (stepBtn) stepBtn.addEventListener('click', () => {
    stopVisualizer();
    stepPhase();
  });

  rpmSlider.addEventListener('change', () => {
    if (visInterval) {
      stopVisualizer();
      startVisualizer();
    }
  });

  // Initialize
  syncOutputs();
  runSimulation();

  // Glossary bootstrap (simple static list)
  const glossaryData = [
    { term: 'Apex seal', definition: 'The long seal at each rotor tip that keeps combustion gases inside the chamber as the rotor moves.' },
    { term: 'Side seal', definition: 'A seal along the rotor\'s side faces that helps separate chambers and control compression.' },
    { term: 'Corner seal', definition: 'Small seals at the junction between apex and side seals that close small gaps in the rotor corners.' },
    { term: 'Eccentric shaft', definition: 'The offset shaft that the rotor rides on; its rotation converts rotor motion into usable output.' },
    { term: 'Housing', definition: 'The outer shell with the special epitrochoid shape that the rotor spins inside.' },
    { term: 'Epitrochoid', definition: 'The specific curved shape of the rotary housing that lets the rotor form three moving chambers.' },
    { term: 'Air–Fuel Ratio (AFR)', definition: 'The ratio of air mass to fuel mass in the mixture entering the engine, often written as “12.0:1”.' },
    { term: 'Detonation (knock)', definition: 'Uncontrolled, rapid combustion that creates sharp pressure spikes and can damage seals and housings.' },
    { term: 'Boost pressure', definition: 'Extra intake pressure from a turbo or supercharger, measured above atmospheric pressure.' },
    { term: 'Porting', definition: 'Modifying intake and exhaust ports in the housing to change airflow and power characteristics.' },
    { term: '13B engine', definition: 'A common two‑rotor Mazda rotary engine used in RX‑7s and other vehicles.' },
    { term: 'Redline', definition: 'The upper RPM limit recommended by the manufacturer for normal operation.' }
  ];

  const glossaryList = document.getElementById('glossary-list');
  const glossarySearch = document.getElementById('glossary-search');

  function renderGlossary(filterText) {
    if (!glossaryList) return;
    const q = (filterText || '').toLowerCase();
    const filtered = glossaryData.filter(item =>
      item.term.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q)
    );

    const grouped = {};
    filtered.forEach(item => {
      const letter = item.term[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(item);
    });

    const letters = Object.keys(grouped).sort();
    glossaryList.innerHTML = letters.map(letter => {
      const itemsHtml = grouped[letter]
        .sort((a, b) => a.term.localeCompare(b.term))
        .map(item => `
          <div class="glossary-item">
            <div class="glossary-term">${item.term}</div>
            <div class="glossary-definition">${item.definition}</div>
          </div>
        `).join('');
      return `
        <div class="glossary-group">
          <div class="glossary-group-letter">${letter}</div>
          ${itemsHtml}
        </div>
      `;
    }).join('') || '<p class="helper-text">No terms match your search.</p>';
  }

  if (glossarySearch) {
    glossarySearch.addEventListener('input', () => {
      renderGlossary(glossarySearch.value);
    });
  }

  renderGlossary('');
})();
