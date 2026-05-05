/* ===========================
   TTG LENDING v2 — SCRIPTS
   =========================== */

// ---- Navbar scroll behavior ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Mobile hamburger menu ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
const hamSpans  = hamburger ? hamburger.querySelectorAll('span') : [];

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) {
      hamSpans[0] && (hamSpans[0].style.transform = 'translateY(7px) rotate(45deg)');
      hamSpans[1] && (hamSpans[1].style.opacity   = '0');
      hamSpans[2] && (hamSpans[2].style.transform = 'translateY(-7px) rotate(-45deg)');
    } else {
      hamSpans.forEach(s => (s.style.transform = s.style.opacity = ''));
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
      hamSpans.forEach(s => (s.style.transform = s.style.opacity = ''));
    });
  });
}

// ---- Scroll-triggered fade animations ----
const fadeEls = document.querySelectorAll(
  '.prog2-card, .state2-card, .why2-metric, .why2-pt, .ps2, .lt2-cat'
);
fadeEls.forEach(el => el.classList.add('fade-hidden'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.children);
    const delay    = siblings.indexOf(entry.target) * 80;
    setTimeout(() => {
      entry.target.classList.add('fade-visible');
      entry.target.classList.remove('fade-hidden');
    }, delay);
    fadeObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => fadeObserver.observe(el));

// ---- Phone number auto-format ----
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (v.length >= 6)      v = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
    else if (v.length >= 3) v = `(${v.slice(0,3)}) ${v.slice(3)}`;
    e.target.value = v;
  });
}

// ---- Form validation & submission ----
const form        = document.getElementById('lead-form');
const submitBtn   = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');

if (form && submitBtn) {
  const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function validateField(field) {
    const val  = field.value.trim();
    const fail =
      (field.required && (val === '' || (field.tagName === 'SELECT' && val === ''))) ||
      (field.type === 'email' && val && !validateEmail(val));
    field.classList.toggle('error', fail);
    return !fail;
  }

  form.querySelectorAll('input, select, textarea').forEach(f => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => { if (f.classList.contains('error')) validateField(f); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) {
      const first = form.querySelector('.error');
      if (first) first.focus();
      return;
    }

    submitBtn.disabled = true;
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    if (btnText)    btnText.style.display    = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';

    const payload = Object.fromEntries(new FormData(form).entries());

    await new Promise(r => setTimeout(r, 1500));

    form.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
    console.log('TTG Lending v2 lead submitted:', payload);
  });
}

// ---- Smooth scroll with offset ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

// ---- Active nav highlighting ----
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav2-links a[href^="#"]');

if (sections.length && navItems.length) {
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navItems.forEach(link =>
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navObs.observe(s));
}

// ---- Lender Network filter tabs ----
const lenderTabs  = document.querySelectorAll('.ltab2');
const lenderCards = document.querySelectorAll('.lender-card2');

lenderTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;

    // Update active tab
    lenderTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Phase 1 — immediately hide non-matching cards
    lenderCards.forEach(card => {
      const cats = card.dataset.cats || '';
      const show = filter === 'all' || cats.split(' ').includes(filter);
      card.classList.toggle('hidden', !show);
    });

    // Phase 2 — stagger-animate the now-visible cards back in
    const visible = Array.from(lenderCards).filter(c => !c.classList.contains('hidden'));
    visible.forEach((card, idx) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(12px)';
      card.style.transition = 'none';
      setTimeout(() => {
        card.style.transition = 'opacity 0.32s ease, transform 0.32s ease';
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      }, idx * 35);
    });
  });
});

// Scroll-triggered fade-in for lender grid
const lenderGrid = document.getElementById('lender-grid');
if (lenderGrid && lenderCards.length) {
  lenderCards.forEach(c => c.classList.add('fade-hidden'));

  const lenderObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const visible = Array.from(entry.target.querySelectorAll('.lender-card2:not(.hidden)'));
      visible.forEach((card, idx) => {
        setTimeout(() => {
          card.classList.add('fade-visible');
          card.classList.remove('fade-hidden');
        }, idx * 35);
      });
      lenderObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  lenderObserver.observe(lenderGrid);
}

// ---- Badge click tooltips — per-lender program terms ----

const lenderProgramTerms = {

  // === CATEGORY DEFAULTS ===
  __defaults__: {
    'conventional':               '3% down (owner-occ) · 15–25% down (investment) · 620 FICO min · Conforming loan limits apply',
    'fha':                        '3.5% down · 580 FICO min · Mortgage insurance required · Primary residence only',
    'va':                         '0% down · No monthly PMI · 580–620 FICO · Veterans & active military only',
    'usda':                       '0% down · Income & area limits apply · 640 FICO · Rural/suburban areas',
    'jumbo':                      'Above conforming limits · 680+ FICO typical · 10–20% down · Full-doc preferred',
    'heloc':                      'Revolving credit line · Interest-only draw period · 80–90% CLTV typical',
    'heloan':                     'Fixed-rate lump-sum home equity loan · Second lien · 80–90% CLTV typical',
    'bank statement':             '12 or 24-month bank statements · No tax returns · Self-employed borrowers',
    'assets':                     'Asset depletion or utilization · Liquid assets divided by loan term = qualifying income',
    'asset depletion':            'Liquid assets ÷ remaining loan term (months) = monthly qualifying income',
    'asset utilization':          'Percentage of total assets counted as ongoing monthly income',
    'asset qualifier':            'Total liquid assets ÷ remaining loan term · No employment required',
    'dscr':                       'Rental income qualifies · No personal income docs · SFR to multifamily · DSCR ≥ 1.0 typical',
    '1099':                       '1099 income only · Independent contractors & gig workers · 12/24-mo history',
    'p&l':                        'CPA-prepared Profit & Loss statement · Self-employed · 12–24 month history',
    'itin':                       'Individual Taxpayer ID · Non-US citizens · 620–680 FICO typical · 20–25% down',
    'bridge':                     'Short-term 12–24 months · Interest-only · Acquisition or repositioning',
    'fix & flip':                 'Purchase + rehab financing · Up to 90–95% LTC · Asset-based · No income docs',
    'construction':               'Ground-up build · Draw schedule · Land + construction cost · Multiple programs',
    'renovation':                 'Purchase + renovation in one loan · FHA 203k or conventional options',
    'manufactured':               'Factory-built homes · Chattel or land-home · Agency and portfolio options',
    'coops':                      'Cooperative housing · Share loan · Limited state availability',
    'non-warr. condo':            'Non-warrantable condominiums · Cannot be sold to Fannie/Freddie · Portfolio lenders',
    'reverse':                    'HECM reverse mortgage · Age 62+ · No monthly payment required · Equity access',
    'foreign national':           'Non-US resident borrowers · 25–35% down · No US credit history required',
    'no ratio':                   'No income or DTI calculation · Equity and asset-based qualifying',
    'doctor loans':               'Medical professionals · High DTI allowed · Student loans excluded from ratio',
    '40-yr i/o':                  '40-year amortization with interest-only period · Reduces initial monthly payment',
    'no fico':                    'No credit score required · Alternative credit history accepted',
    'dpa':                        'Down Payment Assistance · Grants, soft seconds, or forgivable loans',
    'one-time close':             'Single closing for construction + permanent loan · Rate locked at start',
    'blanket / cross-collateralized': 'Multiple properties under one loan · Portfolio lenders · Release provisions available',
    'land / lot loans':           'Vacant land or lot financing · Higher rates typical · 12–36 month terms',
    'chattel':                    'Manufactured home personal property loan · No land included · 700 FICO typical',
    'graduated payment mortgage': 'Payments start lower and step up over time · Long-term affordability play',
    'cross-collateralization':    'Pledge multiple properties as collateral · Blanket structure · Unlocks portfolio equity',
    '5+ unit mf dscr':            'Commercial DSCR · 5+ units · Qualify on net operating income · No personal income docs',
    'bs heloc':                   'Bank Statement HELOC · Qualify on deposits, not tax returns · Self-employed borrowers',
    'condotel':                   'Hotel-condo unit financing · Non-warrantable · Portfolio lenders only',
    'manufactured (chattel)':     'Manufactured home chattel loan · Personal property · No land required',
    'low credit (550+)':          'Programs accepting 550–579 FICO · Limited product set · Higher rate expected',
  },

  // === PER-LENDER OVERRIDES ===

  'American Financial Resources': {
    'fha':         '580 FICO min · 3.5% down · DPA Advantage for first responders, medical & educators · 203k renovation eligible',
    'va':          '0% down · No PMI · Standard VA guidelines · 580 FICO',
    'usda':        '0% down · Rural eligible · 640 FICO · Standard USDA guidelines',
    'renovation':  'FHA 203k · 580 FICO · 3.5% down · Full standard 203k available',
  },

  'Angel Oak': {
    'dscr':        '640 FICO · 80% LTV · From $150K · DSCR ≥ 1.0 · SFR to multifamily',
    'bank statement': '12 or 24-mo · 660 FICO · 90% LTV · Up to $3M',
    'heloc':       'Investment HELOC available · 660 FICO · Competitive CLTV',
    'heloan':      'Fixed-rate home equity · 660 FICO · Investment eligible',
    'jumbo':       '700 FICO · Up to $3M+ · Alt-doc options available',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 85% LTV · Up to $3M',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV · 24-mo history',
    'itin':        'ITIN borrowers · 660 FICO · 80% LTV · Non-US citizens',
    'foreign national': 'Non-US resident · 30% down min · No US credit required · Competitive terms',
    '5+ unit mf dscr': '5–50+ units · DSCR ≥ 1.0 · 75% LTV · $500K–$10M · Not available in NY',
  },

  'Ardri': {
    'dscr':        '620 FICO · 80% LTV · Up to $3M · SFR & multifamily',
    'bank statement': '12/24-mo · 620 FICO · 85% LTV · Up to $3M',
    'bs heloc':    'Bank Statement HELOC · Qualify on deposits · No tax returns · Self-employed',
    'bridge':      'Short-term bridge · 12–24 months · Interest-only · Investment property',
    'foreign national': 'Non-US residents eligible · 30%+ down typical',
    'no ratio':    'No income or DTI calculated · Equity-based qualifying',
    'itin':        'ITIN borrowers accepted · 620 FICO · 80% LTV',
    'assets':      'Asset depletion / utilization · 620 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 620 FICO · 80% LTV',
    'p&l':         'CPA P&L · 620 FICO · 80% LTV · 24-mo history',
  },

  'Axos Bank': {
    'dscr':        '640 FICO · 75% LTV · Up to $3M · SFR & multifamily',
    'bank statement': '660 FICO · 85% LTV · Up to $5M · 12/24-mo',
    'jumbo':       '680 FICO · Up to $20M · Alt-doc eligible',
    'bridge':      'Short-term bridge · Acquisition or cash-out · Investment property',
    'cross-collateralization': 'Pledge multiple properties · Blanket structures · Portfolio investors',
    '5+ unit mf dscr': '5–50+ units · DSCR ≥ 0.75 · 70% LTV · $500K–$20M',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
    'itin':        'ITIN borrowers · 660 FICO · 75% LTV',
  },

  'BluePoint': {
    'dscr':        'BlueXPanded DSCR · 620 FICO · 85% LTV · Up to $3M · SFR & 2–4 unit',
    'bank statement': '12/24-mo · 620 FICO · 90% LTV · Up to $3.5M',
    'itin':        '600 FICO (or no score) · 85% LTV · ITIN borrowers',
    'fha':         '580 FICO min · 3.5% down · Full submission docs required prior to LE',
    'va':          '0% down · 580 FICO · Full submission docs required prior to LE',
    'conventional': '620 FICO · 3–25% down · Full submission docs required prior to LE',
    'jumbo':       '680 FICO · 80% LTV · Full docs required prior to LE',
    'heloan':      'Fixed-rate home equity · 660 FICO · Primary & investment',
    'assets':      'Asset depletion / utilization · 620 FICO · 85% LTV',
    '1099':        '24-mo 1099 · 620 FICO · 85% LTV',
    'p&l':         'CPA P&L · 620 FICO · 85% LTV',
    'manufactured': 'Manufactured homes · Agency guidelines · 5% down typical',
  },

  'Cake Mortgage': {
    'dscr':        '660 FICO · 80% LTV · Up to $3M · SFR & 2–4 unit',
    'bank statement': '12/24-mo · 660 FICO · 85% LTV · Up to $3M',
    'itin':        'ITIN borrowers · 660 FICO · 80% LTV',
    'jumbo':       '700 FICO · Up to $4M · Full-doc & alt-doc',
    '5+ unit mf dscr': '5–20 units · DSCR ≥ 1.0 · 75% LTV · $250K–$5M',
    'non-warr. condo': 'Non-warrantable condo eligible · Investor & primary',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 85% LTV',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV',
    'manufactured': 'Manufactured homes · Flexible guidelines',
  },

  'Carrington': {
    'dscr':        'Investor Advantage · 620 FICO · 85% LTV · Up to $3M · Tiered DSCR pricing',
    'bank statement': 'Alt-doc · From 550 FICO (Flex Advantage) · 12/24-mo · Up to $3M',
    'fha':         '550 FICO min (Flexible Advantage) · 3.5% down · Standard FHA also available from 580',
    'va':          'From 550 FICO · 0% down · Standard VA guidelines',
    'usda':        'From 580 FICO · 0% down · Rural eligible',
    'conventional': '620 FICO · 3–25% down by occupancy & unit count',
    '40-yr i/o':   '40-year IO on Non-QM products · Reduces initial monthly payment',
    'low credit (550+)': 'Flexible Advantage Program · Min 550 FICO · FHA, VA, USDA & Non-QM available',
    'asset depletion': 'Liquid assets ÷ loan term = qualifying income · 620 FICO',
    'jumbo':       '680 FICO · Up to $3M · Full-doc & alt-doc',
    '1099':        '24-mo 1099 · 620 FICO · 85% LTV',
    'p&l':         'CPA P&L · 620 FICO · 85% LTV',
  },

  'Champion Funding': {
    'dscr':        'SFR/2–4u: 600 FICO · 80% LTV · Up to $3M\n5–8u: 700 FICO · 75% LTV · Up to $2M',
    'bank statement': '660 FICO · 85% LTV · 12/24-mo · Up to $3M',
    'itin':        'ITIN DSCR: 660/no-score FICO · Up to $1M · 75% LTV',
    'foreign national': 'Non-US residents · 30%+ down · No US credit required',
    'no ratio':    'No income or DTI · Equity-based qualifying · 660 FICO',
    'jumbo':       '700 FICO · Up to $5M · Full-doc & alt-doc',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
  },

  'Change': {
    'dscr':        '620 FICO · 80% LTV · Up to $3M · SFR & multifamily',
    'bank statement': '660 FICO · 85% LTV · 12/24-mo · Up to $3M',
    'heloan':      'Home equity lump-sum · Fixed rate · Investment eligible · 660 FICO',
    'foreign national': 'Non-US residents eligible · 30%+ down',
    'no ratio':    'No income or DTI calculation · Equity-based qualifying',
    'jumbo':       '680 FICO · Up to $5M · Alt-doc eligible',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
    'itin':        'ITIN borrowers · 660 FICO · 80% LTV',
  },

  'ClickNClose': {
    'fha':         '580 FICO · 3.5% down · One-Time Close construction available',
    'va':          '0% down · One-Time Close construction available · No PMI',
    'conventional': '620 FICO · 3% down · One-Time Close available',
    'usda':        '0% down · Rural eligible · One-Time Close available',
    'construction': 'One-Time Close · Locks rate at start · SFR to multifamily · FHA/VA/Conv',
    'one-time close': 'Single closing for construction + perm · Lock rate upfront · FHA (3.5%), VA (0%), Conv (3%)',
    'dpa':         'Down payment assistance · Grants & soft second liens · Multiple states',
    'renovation':  'Purchase + rehab in one loan · FHA 203k & conventional options',
    'jumbo':       '680 FICO · 10–20% down · Full-doc required',
  },

  'Credit Human': {
    'manufactured (chattel)': 'Chattel loans for manufactured homes · 700 FICO · 5% down min · No land required',
    'chattel':     'Manufactured home personal property loan · 700 FICO · 5% down · Competitive rates',
  },

  'Freedom': {
    'fha':         '550 FICO min · 3.5% down · CA, FL & TX dual-capacity only',
    'va':          '0% down · No PMI · 100% LTV · 550 FICO · CA/FL/TX only',
    'usda':        '0% down · 100% LTV · Rural eligible · CA/FL/TX dual-capacity only',
    'conventional': '620 FICO · 3% down (OO) · 15–25% (investment) · CA/FL/TX dual-capacity only',
    'jumbo':       '680 FICO · Up to $3M · Full-doc · CA/FL/TX only',
    'coops':       'Cooperative housing eligible · Limited state availability',
    'manufactured': 'Manufactured homes under agency guidelines · Standard down payments',
  },

  'Fund Loans': {
    'bank statement': 'Apex · 660 FICO · 90% LTV · $300K–$6M · 12/24-mo · Self-employed',
    'dscr':        'Arete DSCR · 700 FICO · 80% LTV · Up to $5M · DSCR ≥ 1.0',
    'jumbo':       'Up to $6M · 660 FICO · Alt-doc eligible · Apex program',
    '1099':        '660 FICO · 85% LTV · 12/24-mo 1099 · Up to $3M',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV · 24-mo history',
    'itin':        'ITIN borrowers · 660 FICO · 80% LTV',
    'assets':      'Asset depletion / utilization · 660 FICO · 85% LTV',
  },

  'JMAC': {
    'dscr':        'Up to $3.5M · DSCR ≥ 1.0 · No-ratio options · Mixed-use eligible · 660 FICO',
    'bank statement': '12/24-mo · 660 FICO · 85% LTV · Up to $3M',
    'fha':         '580 FICO · 3.5% down · Full agency guidelines',
    'va':          '0% down · 580 FICO · VA eligible',
    'conventional': '620 FICO · Conforming guidelines · 3–25% down',
    'manufactured': 'Manufactured homes under agency guidelines · 5% down',
    'asset depletion': 'Liquid assets ÷ loan term = monthly qualifying income · 660 FICO',
    'asset utilization': 'Percentage of assets as monthly income · 660 FICO',
    'jumbo':       '680 FICO · Up to $3.5M · Full-doc & alt-doc',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
  },

  'Kind Lending': {
    'dscr':        'Up to $3.5M · DSCR ≥ 1.0 · SFR to multifamily · 580 FICO min',
    'bank statement': '12/24-mo · 580 FICO · 85% LTV · Up to $3M',
    'heloc':       'HELOC available · Investment eligible · 580 FICO',
    'jumbo':       'Up to $3M · 620 FICO · Full-doc & alt-doc',
    'fha':         '580 FICO · 3.5% down · DPA grant eligible',
    'va':          '0% down · 580 FICO · VA eligible',
    'usda':        '0% down · Rural eligible · 580 FICO',
    'itin':        'ITIN borrowers · 580+ FICO · Up to $2M',
    'reverse':     'HECM reverse mortgage · Age 62+ · No monthly payment required',
    'dpa grants':  'Down payment grants & second liens · Multiple states · 580 FICO',
    '1-yr self-employed': 'Only 1 year self-employment history required · Flexible qualifying',
    'coops':       'Cooperative housing eligible · 620 FICO',
    'manufactured': 'Manufactured homes · Agency guidelines · 580 FICO',
    'assets':      'Asset depletion / utilization · 580 FICO · 85% LTV',
    '1099':        '24-mo 1099 · 580 FICO · 85% LTV',
    'p&l':         'CPA P&L · 580 FICO · 85% LTV',
    'non-warr. condo': 'Non-warrantable condo eligible · 580 FICO',
  },

  'Lendsure Mortgage Corp': {
    'jumbo':       '90% LTV up to $1M · 80% LTV up to $1.5M · 660 FICO · Alt-doc eligible',
    'dscr':        '620 FICO · 75% LTV · $250K–$15M · SFR to multifamily',
    'bank statement': '660 FICO · 85% LTV · 12/24-mo · Up to $5M',
    'assets':      'Asset Qualifier · 660 FICO · 80–90% LTV · Liquid assets only',
    'fix & flip':  'Up to 90% LTC · 100% rehab budget · $100K–$5M · Investor-only',
    'bridge':      'Short-term bridge · 12–24 months · Investment property · Interest-only',
    'construction': 'Ground-up construction · Draw schedule · SFR & multifamily',
    'renovation':  'Purchase + rehab · Draw schedule · Investor-focused',
    'condotel':    'Condotel financing · Hotel-condo units · Non-warrantable · Portfolio',
    '5+ unit mf dscr': '5–50+ units · DSCR ≥ 0.75 · 75% LTV · $250K–$15M',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
    'itin':        'ITIN borrowers · 660 FICO · 75% LTV',
    'non-warr. condo': 'Non-warrantable condo · Investor & primary · Flexible guidelines',
  },

  'LimaOne': {
    'fix & flip':  'Up to 95% LTC · 100% rehab budget · $100K–$5M · 13–24 month terms · No income docs',
    'bridge':      'Bridge financing · Up to 80% LTV · Interest-only · Fast close · Investor-only',
    'construction': 'Ground-up construction · Up to 90% LTC · Draw schedule · Investor-only',
    'renovation':  'Renovation lending · Up to 95% LTC · Asset-based · No income verification',
  },

  'Loan Store': {
    'dscr':        'SFR/2–4u: 680 FICO · 80% LTV · $250K–$3M\n5–8u: 680 FICO · 70% LTV · $250K–$2M · DSCR ≥ 1.0',
    'heloc':       'Funded in as few as 5 business days · Competitive LTV · Fast digital process',
    'bank statement': '660 FICO · 85% LTV · 12/24-mo · Up to $3M',
    'fha':         '580 FICO · 3.5% down · Standard FHA guidelines',
    'va':          '0% down · 580 FICO · 100% LTV available',
    'conventional': '620 FICO · 3% down (OO) · Conforming limits',
    'fix & flip':  'Via Old North Capital · Asset-based · Up to 90% LTC · No income docs',
    'bridge':      'Via Old North Capital · Short-term · Interest-only · Investment property',
    'construction': 'Construction financing · Draw schedule · SFR & multifamily',
    '5+ unit mf dscr': '5–30 units · DSCR ≥ 1.0 · 75% LTV · $300K–$10M',
    'non-warr. condo': 'Non-warrantable condo · Bank statement & DSCR eligible',
  },

  'Mortgage Financial Services': {
    'conventional': '620 FICO · 3% down (OO) · 15–25% (investment) · Conforming limits',
    'fha':         '580 FICO · 3.5% down · Standard FHA guidelines',
    'va':          '0% down · 580 FICO · VA eligible',
    'usda':        '0% down · Rural eligible · 640 FICO · Standard USDA',
  },

  'New Rez': {
    'dscr':        'SmartVest · 600 FICO · DSCR ≥ 1.0 · Up to $2M · 20 financed properties allowed',
    'bank statement': 'SmartSelf · 660 FICO · 90% LTV · Up to $3M · 12/24-mo',
    'fha':         '580 FICO (standard) · HomeReady/HomePossible from 580 · 3.5% down',
    'va':          '0% down · 580 FICO · VA eligible',
    'usda':        '0% down · 100% LTV · Rural eligible · 640 FICO',
    'conventional': '580 FICO (HomeReady) · 97% LTV available · 3% down',
    'jumbo':       '680 FICO · Up to $3M · Alt-doc eligible',
    'coops':       'Cooperative housing · NY/NJ markets primarily',
    'manufactured': 'Under government guidelines · 3.5–5% down',
    'asset depletion': 'SmartAsset · Liquid assets ÷ loan term = qualifying income · 660 FICO',
    'asset qualifier': 'Total liquid assets ÷ remaining term · 660 FICO · 80% LTV',
    'doctor loans': 'Medical professionals · High DTI allowed · Student loans excluded',
    '40-yr i/o':   '40-year IO on Non-QM · Reduces initial monthly payment significantly',
    'no fico':     'No credit score · Alternative credit history · Non-QM portfolio product',
    '1099':        '24-mo 1099 · SmartSelf · 660 FICO · 85% LTV',
    'non-warr. condo': 'Non-warrantable condo · SmartSelf & SmartVest eligible',
  },

  'NewFi': {
    'dscr':        'Artemis DSCR · 640 FICO · DSCR ≥ 1.0 · 80% LTV · $150K–$3M',
    'bank statement': 'Hercules · 660 FICO · 90% LTV · Up to $3.5M\nOR: 620 FICO · 85% LTV · Up to $2M',
    'heloan':      'Home equity lump-sum · Fixed rate · Investment eligible · 660 FICO',
    'jumbo':       'Up to $3.5M · 660 FICO · Full-doc & alt-doc · Not available in NY',
    'itin':        'ITIN borrowers · 640 FICO · 80% LTV · Up to $2M',
    'non-warr. condo': 'Non-warrantable condo · Investor & primary eligible',
    'conventional': '620 FICO · Conforming · Full submission docs required prior to lock',
    'graduated payment mortgage': 'Payments start lower and step up gradually · Long-term affordability strategy',
    'assets':      'Asset depletion / utilization · 660 FICO · 85% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 85% LTV',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV',
  },

  'NFTYDoor': {
    'heloc':       'Fully digital HELOC · Fast process · Primary & second homes · Up to 90% CLTV',
  },

  'Normandy': {
    'bridge':      'Bridge loans · 12–24 months · Investment property · Quick close · Interest-only',
    'construction': 'Ground-up & renovation construction · Draw schedule · Investor-friendly',
    'renovation':  'Renovation construction loans · Draw schedule · SFR & multifamily',
    'land / lot loans': 'Vacant land & lot financing · Up to 65% LTV · 12–36 month terms',
  },

  'OakTree Funding': {
    'dscr':        '620 FICO · 80% LTV · Up to $5M · SFR to multifamily',
    'bank statement': '660 FICO · 85% LTV · 12/24-mo · Up to $5M',
    'heloc':       'Investment HELOC · 660 FICO · Up to 75% CLTV',
    'heloan':      'Fixed-rate lump-sum · 660 FICO · Investment eligible',
    'jumbo':       '680 FICO · Up to $10M · Alt-doc eligible',
    'itin':        'ITIN borrowers · 660 FICO · 80% LTV',
    'blanket / cross-collateralized': 'SFR & MF portfolio under one loan · Cross-collateral · Release provisions available',
    '5+ unit mf dscr': '5–100+ units · DSCR ≥ 0.75 · 75% LTV · $500K–$20M',
    'assets':      'Asset depletion / utilization · 660 FICO · 80% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 80% LTV',
    'p&l':         'CPA P&L · 660 FICO · 80% LTV',
  },

  'Orion': {
    'dscr':        'COIN DSCR · As low as DSCR 0.01 · Mixed-use eligible · MF up to $20M · 640 FICO',
    'bank statement': '12/24-mo · 660 FICO · 90% LTV · Up to $3M',
    'fha':         '580 FICO · 3.5% down · Standard FHA guidelines',
    'va':          '0% down · 580 FICO · VA eligible',
    'conventional': '620 FICO · Conforming limits · 3–25% down',
    'usda':        '0% down · 640 FICO · Rural eligible',
    'manufactured': 'Manufactured homes · Agency guidelines · 5% down',
    'itin':        'ITIN borrowers · 640 FICO · 80% LTV',
    'doctor loans': 'Medical professionals · High DTI allowed · Student loans excluded',
    'jumbo':       '680 FICO · Up to $5M · Full-doc & alt-doc',
    'non-warr. condo': 'Non-warrantable condo eligible · DSCR & bank statement',
    'assets':      'Asset depletion / utilization · 660 FICO · 85% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 85% LTV',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV',
  },

  'PennyMac': {
    'conventional': '620 FICO · 3% down (HomeReady) · Conforming limits · Not available in NY',
    'fha':         '580 FICO · 3.5% down · Standard FHA · Not available in NY',
    'heloan':      'Fixed-rate home equity loan · Competitive rates · 660 FICO',
    'jumbo':       '700 FICO · Up to $3M · Full-doc required · Not available in NY',
    'manufactured': 'Manufactured homes under FHA/conventional guidelines',
  },

  'Plaza Home Mortgage': {
    'dscr':        'DSCR IS Series · 660–680 FICO · 80% LTV · $100K–$3M · STR eligible',
    'bank statement': 'Solutions NQM 1/3/4 · 660 FICO · 90% LTV · Up to $3M',
    'heloan':      'Fixed-rate home equity · Investment eligible · 660 FICO',
    'fha':         '580 FICO · 3.5% down · Full agency guidelines',
    'va':          '0% down · 580 FICO · VA eligible',
    'usda':        '0% down · 640 FICO · Rural eligible',
    'conventional': '620 FICO · Conforming limits · Coops eligible',
    'jumbo':       '680 FICO · Up to $3M · Alt-doc eligible',
    'renovation':  'FHA 203k & HomeStyle renovation · Purchase + rehab',
    'reverse':     'HECM reverse mortgage · Age 62+ · No monthly payment',
    'coops':       'Cooperative housing eligible · Competitive terms',
    'assets':      'Asset depletion / utilization · 660 FICO · 85% LTV',
    '1099':        '24-mo 1099 · 660 FICO · 85% LTV',
    'p&l':         'CPA P&L · 660 FICO · 85% LTV',
  },

  'PRMG': {
    'bank statement': '12/24-mo · 660 FICO · 90% LTV · Up to $3M',
    'dscr':        '660 FICO · 80% LTV · Up to $3M · DSCR ≥ 1.0',
    'heloc':       'HELOC available — note: no broker compensation on this product',
    'fha':         '580 FICO · 3.5% down · Chenoa DPA eligible · CALHFA eligible',
    'va':          '0% down · 580 FICO · VA eligible',
    'conventional': '620 FICO · CALHFA eligible · 3% down (OO)',
    'usda':        '0% down · 640 FICO · Rural eligible',
    'manufactured': 'Manufactured homes under agency guidelines',
    'jumbo':       '680 FICO · Up to $3M · Alt-doc eligible',
    'foreign national': 'Non-US residents · 30%+ down · ITIN accepted',
    'dpa — chenoa / calhfa': 'Chenoa FHA DPA · CALHFA programs · State DPA in CA, CO, FL, UT & WI',
    'non-warr. condo': 'Non-warrantable condo · DSCR & bank statement eligible',
  },

  'Provident Funding': {
    'conventional': '620 FICO · Conforming limits · Competitive conventional pricing · No FHA/VA/Non-QM',
    'jumbo':       '700 FICO · Up to $3M · Full-doc required · Competitive pricing',
  },

  'Rocket': {
    'bank statement': 'Non-QM alt-doc · 660 FICO · 85% LTV · 12/24-mo',
    'dscr':        '620 FICO · 80% LTV · DSCR ≥ 1.0 · SFR & multifamily',
    'heloan':      'Home equity loan · Fixed rate · Fast digital process · 660 FICO',
    'fha':         '580 FICO · 3.5% down · DPA grants available',
    'va':          '0% down · 580 FICO · VA eligible',
    'conventional': '580 FICO (HomeReady) · 97% LTV available · DPA eligible',
    'jumbo':       '680 FICO · Up to $2.5M · Alt-doc eligible',
    'coops':       'Cooperative housing · Limited markets',
    'manufactured': 'Manufactured homes under agency guidelines',
    '40-yr i/o':   '40-year IO on Non-QM · Reduces initial monthly payment',
    'dpa grants':  'Grants & second lien DPA · Min 580 FICO · Multiple states',
    'non-warr. condo': 'Non-warrantable condo · Select Non-QM programs',
    'assets':      'Asset depletion / utilization · 660 FICO · 85% LTV',
  },

  'SpringEq': {
    'heloc':       '660 FICO (primary) / 700 FICO (investment) · Up to 90% LTV (primary) · $50K–$400K · 5-yr IO draw period',
    'heloan':      'Fixed-rate lump-sum · 660 FICO · 85% LTV · $50K–$400K',
    'dscr':        'Investment DSCR HELOC · 700 FICO · Up to 80% CLTV · Revolving access',
  },

  'Windsor': {
    'conventional': '620 FICO · 3% down (OO) · CALHFA eligible · Coops in certain areas only',
    'fha':         '600 FICO min · 3.5% down · CALHFA eligible · Multiple DPA programs',
    'va':          '0% down · 600 FICO · VA eligible',
    'usda':        '0% down · 640 FICO · Rural eligible',
    'jumbo':       '700 FICO · Up to $3M · Full-doc required',
    'manufactured': 'Conventional guidelines · 5% down typical · 620 FICO',
    'bridge':      'Bridge financing · Short-term · Investment property · Interest-only',
    'dpa — calhfa': 'CALHFA programs · Income & purchase price limits · CA properties',
    'multiple dpa programs': 'CALHFA + additional state & local DPA programs · Multiple layers possible',
    'coops':       'Cooperative housing · Certain areas only · 620 FICO',
  },

};

// ---- Build badge tooltip DOM element (singleton) ----
const badgeTooltip2 = document.createElement('div');
badgeTooltip2.className = 'badge-tooltip2';
badgeTooltip2.id = 'badge-tooltip2';
badgeTooltip2.innerHTML =
  '<span class="btt2-label"></span>' +
  '<span class="btt2-lender"></span>' +
  '<span class="btt2-terms"></span>';
document.body.appendChild(badgeTooltip2);

let activeBadge2 = null;

function normKey(text) {
  return text.toLowerCase()
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTerms(lenderName, badgeText) {
  const key = normKey(badgeText);
  const lenderData = lenderProgramTerms[lenderName] || {};
  return lenderData[key] || lenderProgramTerms.__defaults__[key] || null;
}

function positionTooltip2(badge) {
  const r   = badge.getBoundingClientRect();
  const vw  = window.innerWidth;
  const vh  = window.innerHeight;
  const gap = 8;

  let top   = r.bottom + gap;
  let left  = r.left;
  let above = false;

  badgeTooltip2.style.top  = top + 'px';
  badgeTooltip2.style.left = left + 'px';

  requestAnimationFrame(() => {
    const tr = badgeTooltip2.getBoundingClientRect();
    if (tr.bottom > vh - 12) { top = r.top - tr.height - gap; above = true; }
    if (tr.right > vw - 12)  { left = Math.max(12, vw - tr.width - 12); }
    badgeTooltip2.classList.toggle('tip-above', above);
    badgeTooltip2.style.top  = top + 'px';
    badgeTooltip2.style.left = left + 'px';
  });
}

function showTooltip2(badge, lenderName, terms) {
  badgeTooltip2.querySelector('.btt2-label').textContent  = badge.textContent.trim();
  badgeTooltip2.querySelector('.btt2-lender').textContent = lenderName;
  badgeTooltip2.querySelector('.btt2-terms').textContent  = terms;
  badgeTooltip2.classList.add('visible');
  positionTooltip2(badge);
  activeBadge2 = badge;
}

function hideTooltip2() {
  badgeTooltip2.classList.remove('visible');
  activeBadge2 = null;
}

// Attach click to every badge inside a v2 lender card
document.querySelectorAll('.lender-card2 .badge2').forEach(badge => {
  badge.addEventListener('click', e => {
    e.stopPropagation();

    const card       = badge.closest('.lender-card2');
    const lenderName = card.querySelector('.lender-name2').textContent.trim();
    const terms      = getTerms(lenderName, badge.textContent.trim());

    if (activeBadge2 === badge) { hideTooltip2(); return; }

    if (terms) showTooltip2(badge, lenderName, terms);
    else       hideTooltip2();
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.badge2') && !e.target.closest('#badge-tooltip2')) hideTooltip2();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTooltip2(); });

// ---- Lender card v2 expand / collapse ----
const chevronSVG = `<svg viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

document.querySelectorAll('.lender-card2').forEach(card => {
  const note = card.querySelector('.lender-note2');
  if (!note || !note.textContent.trim()) return;

  const toggle = document.createElement('div');
  toggle.className = 'lender-toggle2';
  toggle.innerHTML =
    `<span class="ltog2-label">View Terms</span>` +
    `<span class="ltog2-chevron">${chevronSVG}</span>`;
  card.appendChild(toggle);

  card.addEventListener('click', () => {
    const isOpen = card.classList.toggle('expanded');
    toggle.querySelector('.ltog2-label').textContent = isOpen ? 'Hide Terms' : 'View Terms';
  });
});
