/* ==========================================================================
   Aura Systems App Logic - Luxury Ice Blue Edition
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------------------------------
  // 1. SPA Tab Navigation & Routing
  // --------------------------------------------------------------------------
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const headerLogo = document.getElementById('btn-logo');

  function switchTab(tabId) {
    // Hide all tabs
    tabContents.forEach(tab => {
      tab.classList.remove('active');
      tab.style.display = 'none';
    });

    // Remove active state from all header links
    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Show target tab
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
      targetTab.style.display = 'block';
      // Force reflow for opacity transition
      targetTab.offsetHeight; 
      targetTab.classList.add('active');
    }

    // Set header links active
    document.querySelectorAll(`.nav-link[data-tab="${tabId}"]`).forEach(link => {
      link.classList.add('active');
    });

    // Scroll to top of window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Event listeners for nav clicks
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link) {
      const tabId = link.getAttribute('data-tab');
      if (tabId) {
        e.preventDefault();
        window.location.hash = tabId;
      }
    }
  });

  headerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = 'home';
  });

  // Handle hash change routing
  function handleRouting() {
    const hash = window.location.hash.substring(1) || 'home';
    const validTabs = ['home', 'configurator', 'gallery', 'support', 'checkout'];
    
    if (validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('home');
    }
  }

  window.addEventListener('hashchange', handleRouting);
  // Initialize routing on first load
  handleRouting();


  // --------------------------------------------------------------------------
  // 2. Configurator State & Socket Compatibility Engine
  // --------------------------------------------------------------------------
  const BASE_PRICE = 2909.00; // Recalibrated base price so default mockup specs total exactly $4,899.00
  const optionCards = document.querySelectorAll('.option-card');
  const configuratorPriceEl = document.getElementById('configurator-price');
  const specsSummaryListEl = document.getElementById('specs-summary-list');
  const selectedCpuValEl = document.getElementById('selected-cpu-val');
  const selectedGpuValEl = document.getElementById('selected-gpu-val');
  const selectedRamValEl = document.getElementById('selected-ram-val');
  const selectedSsdValEl = document.getElementById('selected-ssd-val');
  const selectedCoolerValEl = document.getElementById('selected-cooler-val');
  const selectedCaseValEl = document.getElementById('selected-case-val');
  const selectedPsuValEl = document.getElementById('selected-psu-val');
  const selectedCablesValEl = document.getElementById('selected-cables-val');

  // Compatibility element hooks
  const compatibilityBadgeEl = document.getElementById('compatibility-badge');
  const compatibilityExplanationEl = document.getElementById('compatibility-explanation');
  const btnConfigCheckoutEl = document.getElementById('btn-config-checkout');

  // Checkout elements to update
  const checkoutItemTitleEl = document.getElementById('checkout-item-title');
  const checkoutItemSpecsEl = document.getElementById('checkout-item-specs');
  const summarySubtotalEl = document.getElementById('summary-subtotal');
  const summaryTaxEl = document.getElementById('summary-tax');
  const summaryTotalEl = document.getElementById('summary-total');

  // Configuration parts category list
  const categories = ['cpu', 'motherboard', 'gpu', 'ram', 'ssd', 'cooler', 'case', 'psu', 'cables'];

  function updateConfigurator() {
    let subtotal = BASE_PRICE;
    const selectedSpecs = {};

    // Get current selections across all grids
    categories.forEach(cat => {
      const selectedOption = document.querySelector(`.options-grid[data-category="${cat}"] .option-card.selected`);
      if (selectedOption) {
        const priceOffset = parseFloat(selectedOption.getAttribute('data-price')) || 0;
        const name = selectedOption.getAttribute('data-name');
        const id = selectedOption.getAttribute('data-id');
        const socket = selectedOption.getAttribute('data-socket') || '';
        
        subtotal += priceOffset;
        selectedSpecs[cat] = { id, name, priceOffset, socket };
      }
    });

    // 2a. Sockets Compatibility Validation Engine
    const cpuSocket = selectedSpecs['cpu']?.socket;
    const moboSocket = selectedSpecs['motherboard']?.socket;
    let compatibilityOK = true;

    if (cpuSocket && moboSocket) {
      if (cpuSocket === moboSocket) {
        // Socket matches
        compatibilityBadgeEl.className = 'compatibility-status-badge compatible';
        compatibilityBadgeEl.textContent = '✓ Compatible';
        
        compatibilityExplanationEl.className = 'compatibility-explanation-box compatible active';
        const socketLabels = { LGA1700: 'Intel LGA1700', AM5: 'AMD AM5', AM4: 'AMD AM4' };
        const socketLabel = socketLabels[cpuSocket] || cpuSocket;
        compatibilityExplanationEl.textContent = `✓ CPU and Motherboard matching sockets validated (${socketLabel}).`;
        
        // Restore checkout flow
        btnConfigCheckoutEl.classList.remove('disabled');
        btnConfigCheckoutEl.style.pointerEvents = 'auto';
        btnConfigCheckoutEl.querySelector('span').textContent = 'PROCEED TO CHECKOUT';
      } else {
        // Socket mismatch
        compatibilityOK = false;
        compatibilityBadgeEl.className = 'compatibility-status-badge incompatible';
        compatibilityBadgeEl.textContent = '⚠ Incompatible';
        
        compatibilityExplanationEl.className = 'compatibility-explanation-box incompatible active';
        const socketLabels = { LGA1700: 'Intel LGA1700', AM5: 'AMD AM5', AM4: 'AMD AM4' };
        const cpuSocketLabel = socketLabels[cpuSocket] || cpuSocket;
        const moboSocketLabel = socketLabels[moboSocket] || moboSocket;
        compatibilityExplanationEl.textContent = `⚠ INCOMPATIBLE: CPU requires Socket ${cpuSocketLabel}, but Motherboard uses Socket ${moboSocketLabel}. Please select a matching motherboard.`;
        
        // Lock checkout flow
        btnConfigCheckoutEl.classList.add('disabled');
        btnConfigCheckoutEl.style.pointerEvents = 'none';
        btnConfigCheckoutEl.querySelector('span').textContent = 'RESOLVE COMPATIBILITY ERROR';
      }
    }

    // Update prices on configurator page
    const formattedPrice = formatCurrency(subtotal);
    configuratorPriceEl.textContent = formattedPrice;

    // Update option card text headers
    if (selectedCpuValEl) selectedCpuValEl.textContent = selectedSpecs['cpu']?.name;
    if (selectedGpuValEl) selectedGpuValEl.textContent = selectedSpecs['gpu']?.name;
    if (selectedRamValEl) selectedRamValEl.textContent = selectedSpecs['ram']?.name;
    if (selectedSsdValEl) selectedSsdValEl.textContent = selectedSpecs['ssd']?.name;
    if (selectedCoolerValEl) selectedCoolerValEl.textContent = selectedSpecs['cooler']?.name;
    if (selectedCaseValEl) selectedCaseValEl.textContent = selectedSpecs['case']?.name;
    if (selectedPsuValEl) selectedPsuValEl.textContent = selectedSpecs['psu']?.name;
    if (selectedCablesValEl) selectedCablesValEl.textContent = selectedSpecs['cables']?.name;

    // Update Visualizer Spec List (left column)
    specsSummaryListEl.innerHTML = '';
    categories.forEach(cat => {
      if (selectedSpecs[cat]) {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="spec-label">${cat}</span>
          <span class="spec-value" title="${selectedSpecs[cat].name}">${selectedSpecs[cat].name}</span>
        `;
        specsSummaryListEl.appendChild(li);
      }
    });

    // Construct short specifications string for Checkout summary list
    let shortGpu = selectedSpecs['gpu']?.name.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '').split(' ')[0] + ' ' + selectedSpecs['gpu']?.name.split(' ').pop();
    if(selectedSpecs['gpu']?.name.includes('Super')) {
      shortGpu = selectedSpecs['gpu']?.name.replace('NVIDIA GeForce ', '').replace(' 24GB', '').replace(' 16GB', '');
    }
    const shortCpu = selectedSpecs['cpu']?.name.includes('Ryzen') ? selectedSpecs['cpu']?.name.split(' ').slice(1,3).join(' ') : selectedSpecs['cpu']?.name.split(' ').pop();
    const shortRam = selectedSpecs['ram']?.name.split(' ')[0];
    const specsString = `${shortGpu}, ${shortCpu}, ${shortRam}`;

    checkoutItemSpecsEl.textContent = specsString;

    // Determine title: Custom vs standard
    let buildTitle = "Aura Vanguard - Custom";
    if (selectedSpecs['case']?.id === 'case-prism') {
      buildTitle = "Aura Prism - Custom";
    }
    checkoutItemTitleEl.textContent = buildTitle;

    // Checkout cost items
    const shipping = 150.00;
    const total = subtotal + shipping;

    summarySubtotalEl.textContent = formattedPrice;
    summaryTaxEl.innerHTML = `<span style="font-weight: normal; color: var(--color-text-muted);">Calculated at next step</span>`;
    summaryTotalEl.textContent = formatCurrency(total);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  // Handle option card selection clicks
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      const grid = card.closest('.options-grid');
      
      // Remove selected class from siblings
      grid.querySelectorAll('.option-card').forEach(sibling => {
        sibling.classList.remove('selected');
      });

      // Select clicked card
      card.classList.add('selected');

      // Update state
      updateConfigurator();
    });
  });

  // Configurator Subcategory Tabs switches
  const configTabBtns = document.querySelectorAll('.config-tab-btn');
  const categoryViews = document.querySelectorAll('.category-view');

  configTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-config-cat');

      configTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      categoryViews.forEach(view => {
        view.classList.remove('active');
        if (view.id === `config-cat-${targetCat}`) {
          view.classList.add('active');
        }
      });
    });
  });


  // --------------------------------------------------------------------------
  // 3. RGB Visualizer Logic
  // --------------------------------------------------------------------------
  const rgbDots = document.querySelectorAll('.rgb-dot');
  const rgbThemeLabel = document.getElementById('rgb-theme-label');
  const configuratorRgbGlow = document.getElementById('configurator-rgb-glow');
  const configuratorPcImage = document.querySelector('.config-pc-image');
  const heroPcGlow = document.getElementById('hero-pc-glow');
  const checkoutThumbnailGlow = document.getElementById('checkout-thumbnail-glow');

  const rgbProfiles = {
    ice: {
      name: 'Ice Blue',
      glow: 'rgba(78, 194, 224, 0.3)',
      shadow: '0 0 50px 10px rgba(78, 194, 224, 0.45)',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) saturate(1.15) brightness(1)'
    },
    gold: {
      name: 'Aura Gold',
      glow: 'rgba(245, 166, 35, 0.28)',
      shadow: '0 0 50px 10px rgba(245, 166, 35, 0.4)',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) hue-rotate(170deg) saturate(1.2)'
    },
    crimson: {
      name: 'Crimson Red',
      glow: 'rgba(224, 32, 32, 0.35)',
      shadow: '0 0 50px 10px rgba(224, 32, 32, 0.5)',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) hue-rotate(140deg) saturate(1.6) brightness(0.95)'
    },
    cyberpunk: {
      name: 'Cyberpunk Neon',
      glow: 'linear-gradient(135deg, rgba(0, 240, 255, 0.35), rgba(255, 0, 255, 0.35))',
      shadow: '0 0 50px 10px rgba(0, 240, 255, 0.4)',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) hue-rotate(60deg) saturate(1.8)'
    },
    emerald: {
      name: 'Emerald Green',
      glow: 'rgba(46, 204, 113, 0.32)',
      shadow: '0 0 50px 10px rgba(46, 204, 113, 0.45)',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) hue-rotate(-80deg) saturate(1.3)'
    },
    stealth: {
      name: 'Stealth Black',
      glow: 'rgba(255,255,255,0.01)',
      shadow: 'none',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) grayscale(0.85) brightness(0.5)'
    }
  };

  rgbDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      const profile = rgbProfiles[color];

      if (profile) {
        // Toggle active dot class
        rgbDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');

        // Update RGB Profile Title Label
        rgbThemeLabel.textContent = profile.name;

        // Apply visual updates to Configurator glow
        if (configuratorRgbGlow) {
          configuratorRgbGlow.style.background = profile.glow;
          configuratorRgbGlow.style.boxShadow = profile.shadow;
        }

        // Apply CSS Filters directly to the PC mockup image
        if (configuratorPcImage) {
          configuratorPcImage.style.filter = profile.filter;
        }

        // Propagate RGB settings globally to other page glow areas
        if (heroPcGlow) {
          heroPcGlow.style.background = profile.glow;
        }
        if (checkoutThumbnailGlow) {
          checkoutThumbnailGlow.style.background = profile.glow;
        }
      }
    });
  });


  // --------------------------------------------------------------------------
  // 4. Gallery Configurations Loader
  // --------------------------------------------------------------------------
  const btnGalleryLoads = document.querySelectorAll('.btn-gallery-load');

  const buildsDatabase = {
    'vanguard-custom': {
      cpu: 'cpu-i9',
      motherboard: 'mobo-z790-carbon',
      gpu: 'gpu-4090',
      ram: 'ram-64',
      ssd: 'ssd-4tb',
      cooler: 'cooler-liquid',
      case: 'case-vanguard',
      psu: 'psu-1200',
      cables: 'cables-iceblue',
      rgb: 'ice'
    },
    'vanguard-stealth': {
      cpu: 'cpu-i7',
      motherboard: 'mobo-z790-carbon',
      gpu: 'gpu-4070ts',
      ram: 'ram-32',
      ssd: 'ssd-2tb',
      cooler: 'cooler-air',
      case: 'case-prism',
      psu: 'psu-1000',
      cables: 'cables-black',
      rgb: 'stealth'
    },
    'vanguard-apex': {
      cpu: 'cpu-r9',
      motherboard: 'mobo-x670e-crosshair',
      gpu: 'gpu-4090',
      ram: 'ram-96',
      ssd: 'ssd-8tb',
      cooler: 'cooler-liquid',
      case: 'case-vanguard',
      psu: 'psu-1200',
      cables: 'cables-black',
      rgb: 'crimson'
    }
  };

  btnGalleryLoads.forEach(btn => {
    btn.addEventListener('click', () => {
      const buildId = btn.getAttribute('data-build-config');
      const specsMap = buildsDatabase[buildId];

      if (specsMap) {
        // Go through options and trigger selections
        categories.forEach(cat => {
          const targetCard = document.querySelector(`.options-grid[data-category="${cat}"] .option-card[data-id="${specsMap[cat]}"]`);
          if (targetCard) {
            targetCard.closest('.options-grid').querySelectorAll('.option-card').forEach(sibling => {
              sibling.classList.remove('selected');
            });
            targetCard.classList.add('selected');
          }
        });

        // Trigger RGB dot updates
        const rgbDot = document.querySelector(`.rgb-dot[data-color="${specsMap.rgb}"]`);
        if (rgbDot) {
          rgbDot.click();
        }

        // Recompute calculations
        updateConfigurator();

        // Redirect user to the Configurator tab
        window.location.hash = 'configurator';
      }
    });
  });


  // --------------------------------------------------------------------------
  // 5. FAQ Accordion Panels
  // --------------------------------------------------------------------------
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.closest('.faq-item');
      const faqPanel = faqItem.querySelector('.faq-panel');
      const isOpen = faqItem.classList.contains('open');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
        item.querySelector('.faq-panel').style.maxHeight = null;
      });

      // Toggle current FAQ item
      if (!isOpen) {
        faqItem.classList.add('open');
        faqPanel.style.maxHeight = faqPanel.scrollHeight + "px";
      } else {
        faqItem.classList.remove('open');
        faqPanel.style.maxHeight = null;
      }
    });
  });


  // --------------------------------------------------------------------------
  // 6. Support Forms (With Formspree Email Submission & SMTP Logger Console)
  // --------------------------------------------------------------------------
  const consultationForm = document.getElementById('consultation-form');
  const consultModal = document.getElementById('consult-modal');
  const btnCloseConsultModal = document.getElementById('btn-close-consult-modal');
  const consultTicketIdEl = document.getElementById('consult-ticket-id');
  const smtpLogConsoleEl = document.getElementById('smtp-log-console');

  // Session Booking Form Submit handler
  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather input data
      const name    = document.getElementById('consult-name').value.trim();
      const email   = document.getElementById('consult-email').value.trim();
      const inquiry = document.getElementById('consult-type').value;
      const details = document.getElementById('consult-details').value.trim();

      // Sync reply-to hidden field so Formspree reply goes to the client
      const hiddenReplyTo = document.getElementById('hidden-reply-to');
      if (hiddenReplyTo) hiddenReplyTo.value = email;

      // Generate random ticket code
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId  = `#AURA-CONS-${ticketNum}`;
      consultTicketIdEl.textContent = ticketId;

      // Clear and open modal
      smtpLogConsoleEl.innerHTML = '';
      consultModal.classList.add('active');

      // Simulated dispatch log
      const logLines = [
        { text: 'Initializing connection to Formspree relay...', delay: 200,  type: 'info'    },
        { text: 'TLSv1.3 tunnel established. Connection secure.',  delay: 700,  type: 'info'    },
        { text: `Preparing envelope → Formspree (xykqjnzl)`,  delay: 1300, type: 'info'    },
        { text: `Attaching payload:`,                              delay: 1800, type: 'info'    },
        { text: `  → Client: ${name} (${email})`,                 delay: 2000, type: 'warn'    },
        { text: `  → Inquiry: ${inquiry}`,                        delay: 2200, type: 'warn'    },
        { text: `  → Ticket: ${ticketId}`,                        delay: 2400, type: 'warn'    },
        { text: 'Transmitting to Formspree gateway...',           delay: 2800, type: 'info'    },
      ];
      logLines.forEach(l => setTimeout(() => printSmtpLog(l.text, l.type), l.delay));

      // Real Formspree submission
      const formData = new FormData();
      formData.append('name',         name);
      formData.append('email',        email);
      formData.append('inquiry-type', inquiry);
      formData.append('details',      details);
      formData.append('ticket-id',    ticketId);
      formData.append('_subject',     `⚙️ Aura Systems — Support Request ${ticketId}`);
      formData.append('_replyto',     email);

      fetch('https://formspree.io/f/xykqjnzl', {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        setTimeout(() => {
          if (res.ok) {
            printSmtpLog(`✓ EMAIL DELIVERED → Formspree (xykqjnzl)`, 'success');
            printSmtpLog(`✓ Booking confirmed under ${ticketId}.`,        'success');
          } else {
            printSmtpLog('⚠ Formspree: delivery failed. Check owner email verification.', 'warn');
          }
        }, 3400);
      })
      .catch(() => {
        setTimeout(() => printSmtpLog('⚠ Network error — email not delivered.', 'warn'), 3400);
      });

      // Reset form
      consultationForm.reset();
    });
  }

  function printSmtpLog(text, type = 'info') {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const logLineEl = document.createElement('div');
    logLineEl.className = 'smtp-log-line';
    logLineEl.innerHTML = `
      <span class="smtp-log-time">[${timeStr}]</span>
      <span class="smtp-log-text ${type}">${text}</span>
    `;
    smtpLogConsoleEl.appendChild(logLineEl);
    
    // Auto-scroll console
    smtpLogConsoleEl.scrollTop = smtpLogConsoleEl.scrollHeight;
  }

  if (btnCloseConsultModal) {
    btnCloseConsultModal.addEventListener('click', () => {
      consultModal.classList.remove('active');
    });
  }

  // --------------------------------------------------------------------------
  // 7. Checkout Form Actions
  // --------------------------------------------------------------------------
  const btnFinalizeBuild = document.getElementById('btn-finalize-build');
  const checkoutModal = document.getElementById('checkout-modal');
  const btnCloseCheckoutModal = document.getElementById('btn-close-checkout-modal');
  const successOrderIdEl = document.getElementById('success-order-id');
  const successBuildTypeEl = document.getElementById('success-build-type');
  const successOrderTotalEl = document.getElementById('success-order-total');

  if (btnFinalizeBuild) {
    btnFinalizeBuild.addEventListener('click', () => {
      // Validate shipping forms
      const checkoutInputs = document.querySelectorAll('.checkout-forms-col input[required]');
      let formIsValid = true;
      
      checkoutInputs.forEach(input => {
        if (!input.value.trim()) {
          formIsValid = false;
          input.style.borderColor = '#ff3333';
        } else {
          input.style.borderColor = '';
        }
      });

      if (!formIsValid) {
        alert("Please fill in all required Contact and Shipping fields before completing your order.");
        return;
      }

      // Collect customer details from checkout form
      const custName    = (document.getElementById('checkout-fname')?.value || '') + ' ' + (document.getElementById('checkout-lname')?.value || '');
      const custEmail   = document.getElementById('checkout-email')?.value   || 'Not provided';
      const custPhone   = document.getElementById('checkout-phone')?.value   || 'Not provided';
      const custAddress = (document.getElementById('checkout-address')?.value || '') + ', ' +
                          (document.getElementById('checkout-city')?.value    || '') + ', ' +
                          (document.getElementById('checkout-zip')?.value     || '');

      // Collect selected build specs from the summary list
      const specItems = document.querySelectorAll('#specs-summary-list li');
      let specsText = '';
      specItems.forEach(item => {
        const label = item.querySelector('.spec-label')?.textContent?.toUpperCase() || '';
        const val   = item.querySelector('.spec-value')?.textContent || '';
        specsText  += `${label}: ${val}\n`;
      });

      // Generate order number
      const orderNum     = Math.floor(10000 + Math.random() * 90000);
      const orderId      = `#AURA-${orderNum}`;
      const activeBuild  = checkoutItemTitleEl.textContent;
      const activeTotal  = summaryTotalEl.textContent;

      // Update success modal
      successOrderIdEl.textContent   = orderId;
      successBuildTypeEl.textContent = `${activeBuild} Rig`;
      successOrderTotalEl.textContent = activeTotal;

      // Show modal
      checkoutModal.classList.add('active');

      // ── Send email via Formspree ──
      const orderPayload = new FormData();
      orderPayload.append('_subject',      `🖥️ Aura Systems — New Build Order ${orderId}`);
      orderPayload.append('order-id',      orderId);
      orderPayload.append('build-type',    activeBuild);
      orderPayload.append('order-total',   activeTotal);
      orderPayload.append('customer-name', custName.trim());
      orderPayload.append('customer-email',custEmail);
      orderPayload.append('customer-phone',custPhone);
      orderPayload.append('ship-to',       custAddress);
      orderPayload.append('build-specs',   specsText || 'See configurator selection');
      orderPayload.append('_replyto',      custEmail);

      fetch('https://formspree.io/f/xykqjnzl', {
        method:  'POST',
        body:    orderPayload,
        headers: { 'Accept': 'application/json' }
      })
      .then(res => {
        if (res.ok) {
          console.log(`✓ Order email for ${orderId} delivered → Formspree (xykqjnzl)`);
        } else {
          console.warn('Formspree: order email delivery failed. Check email verification.');
        }
      })
      .catch(() => console.warn('Network error — order email not sent.'));
    });
  }

  if (btnCloseCheckoutModal) {
    btnCloseCheckoutModal.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
      
      // Reset checkout form fields
      const checkoutInputs = document.querySelectorAll('.checkout-forms-col input');
      checkoutInputs.forEach(input => input.value = '');

      // Return to home page
      window.location.hash = 'home';
    });
  }

  // Close modals when clicking outside card boundary
  window.addEventListener('click', (e) => {
    if (e.target === consultModal) {
      consultModal.classList.remove('active');
    }
    if (e.target === checkoutModal) {
      checkoutModal.classList.remove('active');
    }
  });

  // Load default visualizer filters on page startup (Trigger click on default dots)
  const defaultRgbDot = document.querySelector('.rgb-dot[data-color="ice"]');
  if (defaultRgbDot) {
    defaultRgbDot.click();
  }


  // --------------------------------------------------------------------------
  // 8. Live Telemetry Engine (Updates every 2 seconds)
  // --------------------------------------------------------------------------
  const telemetryCpuTempEl  = document.getElementById('telemetry-cpu-temp');
  const telemetryCpuLoadEl  = document.getElementById('telemetry-cpu-load');
  const telemetryGpuTempEl  = document.getElementById('telemetry-gpu-temp');
  const telemetryGpuLoadEl  = document.getElementById('telemetry-gpu-load');
  const fillCpuTemp         = document.getElementById('fill-cpu-temp');
  const fillCpuLoad         = document.getElementById('fill-cpu-load');
  const fillGpuTemp         = document.getElementById('fill-gpu-temp');
  const fillGpuLoad         = document.getElementById('fill-gpu-load');
  const telemetryFanSpeedEl = document.getElementById('telemetry-fan-speed');
  const telemetryFanSpinner = document.getElementById('telemetry-fan-spinner');
  const telemetryPulseDot   = document.getElementById('telemetry-pulse-dot');
  const telemetryStatusText = document.getElementById('telemetry-status-text');
  const btnRunBenchmark     = document.getElementById('btn-run-benchmark');

  // Hero HUD elements
  const heroHudTemp = document.getElementById('hero-hud-temp');
  const heroHudLoad = document.getElementById('hero-hud-load');

  let isBenchmarkActive = false;
  let benchmarkTimeoutId = null;

  // Helper: random integer in range
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper: clamp a value
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Core telemetry update – called every 2 seconds
  function updateTelemetry() {
    let cpuLoad, cpuTemp, gpuLoad, gpuTemp, fanRpm;

    if (isBenchmarkActive) {
      // Benchmark mode: high and fluctuating
      cpuLoad = randInt(82, 99);
      cpuTemp = randInt(78, 95);
      gpuLoad = randInt(88, 99);
      gpuTemp = randInt(74, 90);
      fanRpm  = randInt(2200, 3400);
    } else {
      // Idle / normal desktop usage
      cpuLoad = randInt(4, 22);
      cpuTemp = randInt(30, 48);
      gpuLoad = randInt(2, 15);
      gpuTemp = randInt(28, 42);
      fanRpm  = randInt(700, 1100);
    }

    // Determine if any value is stressed (high)
    const cpuStressed = cpuLoad > 75 || cpuTemp > 70;
    const gpuStressed = gpuLoad > 75 || gpuTemp > 70;

    // Update displayed values
    telemetryCpuLoadEl.textContent = `${cpuLoad}%`;
    telemetryCpuTempEl.textContent = `${cpuTemp}°C`;
    telemetryGpuLoadEl.textContent = `${gpuLoad}%`;
    telemetryGpuTempEl.textContent = `${gpuTemp}°C`;
    telemetryFanSpeedEl.textContent = `${fanRpm.toLocaleString()} RPM`;

    // Update progress bars (max scale: load=100%, temp=100°C)
    fillCpuLoad.style.width = `${cpuLoad}%`;
    fillCpuTemp.style.width = `${cpuTemp}%`;
    fillGpuLoad.style.width = `${gpuLoad}%`;
    fillGpuTemp.style.width = `${gpuTemp}%`;

    // Toggle stressed state on fills and labels
    [fillCpuLoad, fillCpuTemp].forEach(el => el.classList.toggle('stressed', cpuStressed));
    [fillGpuLoad, fillGpuTemp].forEach(el => el.classList.toggle('stressed', gpuStressed));
    [telemetryCpuLoadEl, telemetryCpuTempEl].forEach(el => el.classList.toggle('stressed', cpuStressed));
    [telemetryGpuLoadEl, telemetryGpuTempEl].forEach(el => el.classList.toggle('stressed', gpuStressed));

    // Fan spinner speed change
    if (telemetryFanSpinner) {
      const anyStressed = cpuStressed || gpuStressed;
      telemetryFanSpinner.classList.toggle('stressed', anyStressed);
    }

    // Pulse dot + status text change
    if (isBenchmarkActive) {
      if (telemetryPulseDot) telemetryPulseDot.classList.add('stressed');
      if (telemetryStatusText) telemetryStatusText.textContent = '⚡ BENCHMARK ACTIVE';
    } else {
      if (telemetryPulseDot) telemetryPulseDot.classList.remove('stressed');
      if (telemetryStatusText) telemetryStatusText.textContent = 'SYS STAT: RUNNING';
    }

    // Hero HUD updates
    if (heroHudTemp) heroHudTemp.textContent = `${cpuTemp}°C`;
    if (heroHudLoad) heroHudLoad.textContent = `${cpuLoad}%`;
  }

  // Initialize and start telemetry ticker (2s interval)
  updateTelemetry();
  const telemetryInterval = setInterval(updateTelemetry, 2000);


  // --------------------------------------------------------------------------
  // 9. Benchmark Button (Toggle with Auto-Stop after 30s)
  // --------------------------------------------------------------------------
  if (btnRunBenchmark) {
    btnRunBenchmark.addEventListener('click', () => {
      if (isBenchmarkActive) {
        // Stop benchmark manually
        isBenchmarkActive = false;
        btnRunBenchmark.classList.remove('active');
        btnRunBenchmark.querySelector('span').textContent = 'Run Benchmark';
        if (benchmarkTimeoutId) {
          clearTimeout(benchmarkTimeoutId);
          benchmarkTimeoutId = null;
        }
        updateTelemetry();
      } else {
        // Start benchmark
        isBenchmarkActive = true;
        btnRunBenchmark.classList.add('active');
        btnRunBenchmark.querySelector('span').textContent = 'Stop Benchmark';
        updateTelemetry();

        // Auto-stop after 30 seconds
        benchmarkTimeoutId = setTimeout(() => {
          isBenchmarkActive = false;
          btnRunBenchmark.classList.remove('active');
          btnRunBenchmark.querySelector('span').textContent = 'Run Benchmark';
          benchmarkTimeoutId = null;
          updateTelemetry();
        }, 30000);
      }
    });
  }

});
