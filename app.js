/**
 * Multi-Lingual WYSIWYG Japanese Receipt Generator - Core Application Logic
 * Implements reactive WYSIWYG bindings, JPY tax calculations, responsive A4 scaling, and dynamic Hanko stamp rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Configuration ---
  const state = {
    lang: 'ja',
    layout: 'portrait',
    currency: '￥',
    receiptNo: 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '01',
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    addressee: '株式会社グローバル・トラベル',
    addresseeTitle: '様',
    totalAmount: 110000,
    isAutoTax: true,
    isInvoiceMode: true,
    taxRate10Percent: 100000,
    taxAmount10Percent: 10000,
    taxRate8Percent: 0,
    taxAmount8Percent: 0,
    registrationNo: 'T1234567890123',
    proviso: '宿泊費として',
    notes: '【お振込先】\n桜銀行　京都支店\n普通　１２３４５６７\n京都民泊・桜\n\n※お振込手数料は貴社にてご負担願います。',
    issuerName: '京都民泊・桜',
    issuerAddress: '京都府京都市中京区桜小路123-4',
    issuerTel: '075-123-4567',
    issuerEmail: 'stay@kyoto-sakura.jp',
    hankoText: '京都民泊\n桜之印',
    useHanko: true,
    items: [
      { desc: '宿泊費', qty: 1, price: 110000 }
    ]
  };

  // --- Quick Provisos Options Map ---
  const customProvisos = {
    ja: ["民宿宿泊費として", "清掃サービス費として", "宿泊費及び清掃費として", "施設利用料として"],
    zh_CN: ["民宿住宿费", "清洁服务费", "住宿费及清洁费", "设施使用费"],
    zh_TW: ["民宿住宿費", "清潔服務費", "住宿費及清潔費", "設施使用費"],
    en: ["Accommodation fee", "Cleaning service fee", "Accommodation and cleaning fee", "Facility usage fee"]
  };

  // --- DOM Elements ---
  const elements = {
    // Control inputs
    langBtns: document.querySelectorAll('.lang-btn'),
    currencySelect: document.getElementById('ctrl-currency'),
    receiptNoInput: document.getElementById('ctrl-receipt-no'),
    dateInput: document.getElementById('ctrl-date'),
    dueDateInput: document.getElementById('ctrl-due-date'),
    addresseeInput: document.getElementById('ctrl-addressee'),
    addresseeTitleSelect: document.getElementById('ctrl-title'),
    totalAmountInput: document.getElementById('ctrl-amount'),
    isAutoTaxInput: document.getElementById('ctrl-auto-tax'),
    isInvoiceModeInput: document.getElementById('ctrl-invoice-mode'),
    taxRate10Input: document.getElementById('ctrl-tax-10-base'),
    taxAmount10Input: document.getElementById('ctrl-tax-10-val'),
    registrationNoInput: document.getElementById('ctrl-registration-no'),
    notesInput: document.getElementById('ctrl-notes'),
    issuerNameInput: document.getElementById('ctrl-issuer-name'),
    issuerAddressInput: document.getElementById('ctrl-issuer-address'),
    issuerTelInput: document.getElementById('ctrl-issuer-tel'),
    issuerEmailInput: document.getElementById('ctrl-issuer-email'),
    hankoTextInput: document.getElementById('ctrl-hanko-text'),
    useHankoInput: document.getElementById('ctrl-use-hanko'),
    
    // Quick tags container
    tagsContainer: document.getElementById('proviso-tags'),
    
    // Print/Export Buttons
    btnPrint: document.getElementById('btn-print'),
    btnReset: document.getElementById('btn-reset'),

    // Preview Layout elements
    previewWorkspace: document.querySelector('.preview-workspace'),
    receiptWrapper: document.querySelector('.receipt-wrapper'),
    receiptSheet: document.querySelector('.receipt-sheet'),
    
    prevReceiptNo: document.getElementById('prev-receipt-no'),
    prevDate: document.getElementById('prev-date'),
    prevDueDate: document.getElementById('prev-due-date'),
    prevAddressee: document.getElementById('prev-addressee'),
    prevHonorific: document.getElementById('prev-honorific'),
    prevAmount: document.getElementById('prev-amount'),
    prevNotes: document.getElementById('prev-notes'),
    

    prevBreakdownBox: document.getElementById('prev-breakdown-box'),
    prevTaxExclusive: document.getElementById('prev-tax-exclusive'),
    prevTax10Base: document.getElementById('prev-tax-10-base'),
    prevTax10Val: document.getElementById('prev-tax-10-val'),
    prevTax10ValDup: document.getElementById('prev-tax-10-val-dup'),
    prevRegistration: document.getElementById('prev-issuer-registration'),
    prevIssuerRegistrationContainer: document.getElementById('prev-issuer-registration-container'),
    
    prevIssuerName: document.getElementById('prev-issuer-name'),
    prevIssuerAddress: document.getElementById('prev-issuer-address'),
    prevIssuerTel: document.getElementById('prev-issuer-tel'),
    prevIssuerEmail: document.getElementById('prev-issuer-email'),
    prevStampArea: document.getElementById('prev-stamp-area'),
    hankoCanvas: document.getElementById('hanko-canvas'),
    
    // Label translations targeting in receipt
    receiptTitleText: document.getElementById('receipt-title-text'),
    lblReceiptNo: document.getElementById('lbl-receipt-no'),
    lblReceiptDate: document.getElementById('lbl-receipt-date'),
    lblDueDate: document.getElementById('lbl-due-date'),
    lblAmount: document.getElementById('lbl-amount'),
    lblNotes: document.getElementById('lbl-notes'),
    prevStampPlaceholder: document.getElementById('prev-stamp-placeholder'),

    lblBreakdownTitle: document.getElementById('lbl-breakdown-title'),
    lblBreakdownExclusive: document.getElementById('lbl-breakdown-exclusive'),
    lblBreakdownTax: document.getElementById('lbl-breakdown-tax'),
    lblBreakdown10Base: document.getElementById('lbl-breakdown-10-base'),
    lblBreakdown10Val: document.getElementById('lbl-breakdown-10-val'),
    lblIssuerRegistration: document.getElementById('lbl-issuer-registration'),

    // Settings modal elements
    btnSettings: document.getElementById('btn-settings'),
    settingsModal: document.getElementById('settings-modal'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    layoutBtns: document.querySelectorAll('.layout-btn')
  };

  // --- Initialize App State from UI ---
  function init() {
    // Populate form with initial values in state
    elements.currencySelect.value = state.currency;
    elements.receiptNoInput.value = state.receiptNo;
    elements.dateInput.value = state.date;
    elements.dueDateInput.value = state.dueDate;
    elements.addresseeInput.value = state.addressee;
    elements.addresseeTitleSelect.value = state.addresseeTitle;
    elements.totalAmountInput.value = state.totalAmount;
    elements.isAutoTaxInput.checked = state.isAutoTax;
    elements.isInvoiceModeInput.checked = state.isInvoiceMode;
    elements.taxRate10Input.value = state.taxRate10Percent;
    elements.taxAmount10Input.value = state.taxAmount10Percent;
    elements.registrationNoInput.value = state.registrationNo;
    elements.notesInput.value = state.notes;
    elements.issuerNameInput.value = state.issuerName;
    elements.issuerAddressInput.value = state.issuerAddress;
    elements.issuerTelInput.value = state.issuerTel;
    elements.issuerEmailInput.value = state.issuerEmail;
    elements.hankoTextInput.value = state.hankoText;
    elements.useHankoInput.checked = state.useHanko;

    // Set initial active language button
    elements.langBtns.forEach(btn => {
      if (btn.dataset.lang === state.lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Set initial active layout button and body/sheet classes
    elements.layoutBtns.forEach(btn => {
      if (btn.dataset.layout === state.layout) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    if (state.layout === 'portrait') {
      document.body.classList.add('layout-portrait');
      document.body.classList.remove('layout-landscape');
      elements.receiptSheet.classList.add('layout-portrait');
      elements.receiptSheet.classList.remove('layout-landscape');
    } else {
      document.body.classList.add('layout-landscape');
      document.body.classList.remove('layout-portrait');
      elements.receiptSheet.classList.add('layout-landscape');
      elements.receiptSheet.classList.remove('layout-portrait');
    }



    // Calculate initial sum & render sidebar items
    calculateTotalSum();
    renderSidebarItems();

    // Perform initial calculations, scaling, and render
    handleTaxCalculations();
    renderPreview();
    updateResponsiveScale();

    // Event listeners
    bindEvents();
  }

  // --- Bind Event Listeners ---
  function bindEvents() {
    // Input text and selection bindings
    const inputs = [
      { el: elements.receiptNoInput, key: 'receiptNo' },
      { el: elements.dateInput, key: 'date' },
      { el: elements.dueDateInput, key: 'dueDate' },
      { el: elements.addresseeInput, key: 'addressee' },
      { el: elements.addresseeTitleSelect, key: 'addresseeTitle' },
      { el: elements.registrationNoInput, key: 'registrationNo' },
      { el: elements.notesInput, key: 'notes' },
      { el: elements.issuerNameInput, key: 'issuerName' },
      { el: elements.issuerAddressInput, key: 'issuerAddress' },
      { el: elements.issuerTelInput, key: 'issuerTel' },
      { el: elements.issuerEmailInput, key: 'issuerEmail' },
      { el: elements.hankoTextInput, key: 'hankoText' }
    ];

    inputs.forEach(({ el, key }) => {
      el.addEventListener('input', (e) => {
        state[key] = e.target.value;
        if (key === 'issuerName' && !elements.hankoTextInput.value) {
          // Sync hanko text if user changes issuer and hanko is empty
          state.hankoText = e.target.value;
          elements.hankoTextInput.value = e.target.value;
        }
        renderPreview();
      });
    });

    // Language Toggle
    elements.langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.lang = btn.dataset.lang;
        
        // Auto-change honorific standard based on language
        if (state.lang === 'ja') {
          state.addresseeTitle = '様';
        } else if (state.lang === 'zh_CN' || state.lang === 'zh_TW') {
          state.addresseeTitle = '先生/女士 御中';
        } else {
          state.addresseeTitle = 'Esq.';
        }
        elements.addresseeTitleSelect.value = state.addresseeTitle;

        renderPreview();
      });
    });

    // Currency Switcher
    elements.currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      renderPreview();
    });

    // Total Amount & Numbers
    elements.totalAmountInput.addEventListener('input', (e) => {
      state.totalAmount = parseFloat(e.target.value) || 0;
      handleTaxCalculations();
      renderPreview();
    });


    // Checkboxes
    elements.isAutoTaxInput.addEventListener('change', (e) => {
      state.isAutoTax = e.target.checked;
      if (state.isAutoTax) {
        elements.taxRate10Input.disabled = true;
        elements.taxAmount10Input.disabled = true;
        handleTaxCalculations();
      } else {
        elements.taxRate10Input.disabled = false;
        elements.taxAmount10Input.disabled = false;
      }
      renderPreview();
    });

    elements.isInvoiceModeInput.addEventListener('change', (e) => {
      state.isInvoiceMode = e.target.checked;
      renderPreview();
    });


    elements.useHankoInput.addEventListener('change', (e) => {
      state.useHanko = e.target.checked;
      renderPreview();
    });

    // Custom tax entry when auto-tax is disabled
    elements.taxRate10Input.addEventListener('input', (e) => {
      state.taxRate10Percent = parseFloat(e.target.value) || 0;
      renderPreview();
    });
    elements.taxAmount10Input.addEventListener('input', (e) => {
      state.taxAmount10Percent = parseFloat(e.target.value) || 0;
      renderPreview();
    });

    // Settings Modal toggles
    elements.btnSettings.addEventListener('click', () => {
      elements.settingsModal.classList.remove('hidden');
    });

    elements.btnCloseSettings.addEventListener('click', () => {
      elements.settingsModal.classList.add('hidden');
    });

    elements.btnSaveSettings.addEventListener('click', () => {
      elements.settingsModal.classList.add('hidden');
      renderPreview();
    });

    elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === elements.settingsModal) {
        elements.settingsModal.classList.add('hidden');
      }
    });

    // Layout Selector Buttons
    elements.layoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.layoutBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.layout = btn.dataset.layout;

        if (state.layout === 'portrait') {
          document.body.classList.add('layout-portrait');
          document.body.classList.remove('layout-landscape');
          elements.receiptSheet.classList.add('layout-portrait');
          elements.receiptSheet.classList.remove('layout-landscape');
        } else {
          document.body.classList.add('layout-landscape');
          document.body.classList.remove('layout-portrait');
          elements.receiptSheet.classList.add('layout-landscape');
          elements.receiptSheet.classList.remove('layout-portrait');
        }

        renderPreview();
        updateResponsiveScale();
      });
    });

    // Export PDF / Print with Dynamic Orientation style injection
    elements.btnPrint.addEventListener('click', () => {
      const existingStyle = document.getElementById('dynamic-print-style');
      if (existingStyle) existingStyle.remove();

      const style = document.createElement('style');
      style.id = 'dynamic-print-style';
      style.innerHTML = `@page { size: A4 ${state.layout}; margin: 0; }`;
      document.head.appendChild(style);

      window.print();
    });

    // Reset button
    elements.btnReset.addEventListener('click', () => {
      if (confirm('全ての入力項目を初期値に戻しますか？ (Are you sure you want to reset all fields?)')) {
        localStorage.clear();
        window.location.reload();
      }
    });

    // Add Item button
    document.getElementById('btn-add-item').addEventListener('click', () => {
      let defaultDesc = '宿泊費';
      if (state.lang === 'en') defaultDesc = 'Accommodation';
      else if (state.lang === 'zh_CN' || state.lang === 'zh_TW') defaultDesc = '住宿费';
      
      state.items.push({ desc: defaultDesc, qty: 1, price: 0 });
      renderSidebarItems();
      calculateTotalSum();
      handleTaxCalculations();
      renderPreview();
    });

    // Handle window resize for dynamic preview scale
    window.addEventListener('resize', updateResponsiveScale);
  }

  // --- Auto Tax Calculations ---
  function handleTaxCalculations() {
    if (!state.isAutoTax) return;

    // For Minshuku/lodgings, 10% standard rate applies.
    // Total Amount = Tax Exclusive Amount (100%) + Consumption Tax (10%)
    // Therefore, Tax Exclusive = Total / 1.10
    // Tax Amount = Total - Tax Exclusive
    const total = state.totalAmount;
    const isJpy = (state.currency === '￥');
    
    if (isJpy) {
      state.taxRate10Percent = Math.round(total / 1.10);
      state.taxAmount10Percent = total - state.taxRate10Percent;
    } else {
      // 2 Decimal points for USD/EUR/CNY etc.
      state.taxRate10Percent = Math.round((total / 1.1) * 100) / 100;
      state.taxAmount10Percent = Math.round((total - state.taxRate10Percent) * 100) / 100;
    }

    elements.taxRate10Input.value = state.taxRate10Percent;
    elements.taxAmount10Input.value = state.taxAmount10Percent;
  }

  // --- Render Sidebar Items Manager ---
  function renderSidebarItems() {
    const listContainer = document.getElementById('fee-items-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    state.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'fee-item-row';
      row.innerHTML = `
        <div class="col-desc">
          <input type="text" class="item-desc-input" data-index="${index}" value="${item.desc}" placeholder="品名/項目">
        </div>
        <div class="col-qty">
          <input type="number" class="item-qty-input" data-index="${index}" min="1" step="1" value="${item.qty}" placeholder="数量">
        </div>
        <div class="col-price">
          <input type="number" class="item-price-input" data-index="${index}" min="0" step="any" value="${item.price}" placeholder="単価">
        </div>
        <button type="button" class="btn-delete-row" data-index="${index}" title="Delete Row" ${state.items.length === 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
          🗑️
        </button>
      `;
      listContainer.appendChild(row);
    });

    // Add event listeners to inputs
    listContainer.querySelectorAll('.item-desc-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        state.items[idx].desc = e.target.value;
        renderPreview();
      });
    });

    listContainer.querySelectorAll('.item-qty-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        state.items[idx].qty = parseInt(e.target.value) || 1;
        calculateTotalSum();
        handleTaxCalculations();
        renderPreview();
      });
    });

    listContainer.querySelectorAll('.item-price-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        state.items[idx].price = parseFloat(e.target.value) || 0;
        calculateTotalSum();
        handleTaxCalculations();
        renderPreview();
      });
    });

    listContainer.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        if (state.items.length > 1) {
          state.items.splice(idx, 1);
          calculateTotalSum();
          handleTaxCalculations();
          renderSidebarItems();
          renderPreview();
        }
      });
    });
  }

  // --- Calculate Items Sum ---
  function calculateTotalSum() {
    let sum = 0;
    state.items.forEach(item => {
      sum += (item.qty || 1) * (item.price || 0);
    });
    state.totalAmount = sum;
    elements.totalAmountInput.value = sum;
  }



  // --- Formatting Helpers ---
  function formatCurrency(amount, currency) {
    const num = parseFloat(amount) || 0;
    const isJpy = (currency === '￥');
    const decimals = isJpy ? 0 : 2;
    const formattedNum = new Intl.NumberFormat(state.lang === 'ja' ? 'ja-JP' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
    
    if (isJpy) {
      // Traditional Japanese JPY amounts on receipts start with a currency sign and end with a dash.
      // E.g., ￥123,456- (防止伪造 - prevents adding extra numbers)
      return `${currency}${formattedNum}-`;
    } else {
      return `${currency}${formattedNum}`;
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    
    if (state.lang === 'ja') {
      return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    } else if (state.lang === 'zh_CN' || state.lang === 'zh_TW') {
      return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    } else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return dateObj.toLocaleDateString('en-US', options);
    }
  }

  // --- Virtual Hanko Stamp (角印) Canvas Engine ---
  function drawHanko() {
    const canvas = elements.hankoCanvas;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!state.useHanko || !state.hankoText) {
      elements.hankoCanvas.style.display = 'none';
      return;
    }
    
    elements.hankoCanvas.style.display = 'block';

    const w = canvas.width;
    const h = canvas.height;
    
    // Create red ink stamp feel
    const stampColor = 'rgba(220, 38, 38, 0.88)';
    ctx.strokeStyle = stampColor;
    ctx.fillStyle = stampColor;
    
    // 1. Draw border frame with slight retro rough edges
    ctx.lineWidth = 4;
    ctx.lineJoin = 'miter';
    ctx.strokeRect(6, 6, w - 12, h - 12);
    
    // Inner thin border (common in Japanese official square seals)
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // 2. Set Up Text Drawing (Top-to-Bottom, Right-to-Left)
    // We split input by newline. If no newline, we intelligently split based on length.
    let lines = state.hankoText.split('\n');
    if (lines.length === 1) {
      const text = state.hankoText.trim();
      if (text.length <= 4) {
        // 2 columns: Right, Left
        lines = [text.slice(0, 2), text.slice(2)];
      } else if (text.length <= 9) {
        // 3 columns: Right, Middle, Left
        lines = [text.slice(0, 3), text.slice(3, 6), text.slice(6)];
      } else {
        // 4 columns
        const colSize = Math.ceil(text.length / 4);
        lines = [
          text.slice(0, colSize),
          text.slice(colSize, colSize * 2),
          text.slice(colSize * 2, colSize * 3),
          text.slice(colSize * 3)
        ];
      }
    }

    // Filter empty lines
    lines = lines.map(l => l.trim()).filter(l => l.length > 0);
    const colCount = lines.length;
    if (colCount === 0) return;

    // Draw each column vertically from right to left
    const colWidth = (w - 24) / colCount;
    ctx.font = 'bold 15px "Noto Serif JP", "Yu Mincho", serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let c = 0; c < colCount; c++) {
      // In Japanese seals, columns are ordered from RIGHT to LEFT.
      // So colIndex 0 (first element) is drawn on the rightmost column.
      const colIndex = colCount - 1 - c;
      const colX = 12 + colIndex * colWidth + colWidth / 2;
      
      const charStr = lines[c];
      const charCount = charStr.length;
      if (charCount === 0) continue;

      const rowHeight = (h - 24) / charCount;

      for (let r = 0; r < charCount; r++) {
        const charY = 12 + r * rowHeight + rowHeight / 2;
        const char = charStr[r];

        // Apply a very subtle organic jitter to text position to look hand-stamped
        const jitterX = (Math.random() - 0.5) * 0.4;
        const jitterY = (Math.random() - 0.5) * 0.4;

        // Dynamic font size depending on row/col constraints
        const fontSize = Math.min(colWidth * 0.8, rowHeight * 0.8);
        ctx.font = `bold ${fontSize}px "Noto Serif JP", "Yu Mincho", serif`;

        ctx.fillText(char, colX + jitterX, charY + jitterY);
      }
    }

    // 3. Add retro overlay (subtle ink fading spots)
    // Draw some tiny transparent white dots to simulate physical wooden/stone seal texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 25; i++) {
      const dotX = 6 + Math.random() * (w - 12);
      const dotY = 6 + Math.random() * (h - 12);
      const dotSize = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Real-time WYSIWYG Localization Engine ---
  function renderPreview() {
    const t = TRANSLATIONS[state.lang] || TRANSLATIONS['ja'];

    // 1. Update Preview Text Labels (Translation)
    if (elements.receiptTitleText) {
      elements.receiptTitleText.textContent = t.title;
    }
    elements.lblReceiptNo.textContent = t.receiptNo;
    elements.lblReceiptDate.textContent = t.date;
    elements.lblDueDate.textContent = t.dueDate;
    elements.lblAmount.textContent = t.amount;
    elements.lblNotes.textContent = t.notes;

    if (elements.prevStampPlaceholder) {
      elements.prevStampPlaceholder.innerHTML = t.stampPlaceholder.replace(' / ', '<br>').replace(' /', '<br>').replace('/ ', '<br>').replace('/', '<br>');
    }

    // Breakdown table labels
    elements.lblBreakdownTitle.textContent = t.breakdown;
    elements.lblBreakdownExclusive.textContent = t.taxExclusive;
    elements.lblBreakdownTax.textContent = t.consumptionTax;
    elements.lblBreakdown10Base.textContent = t.taxRate10;
    elements.lblBreakdown10Val.textContent = t.taxAmount10;
    elements.lblIssuerRegistration.textContent = t.registrationNo;

    // 2. Update Live Data Values
    elements.prevReceiptNo.textContent = state.receiptNo;
    elements.prevDate.textContent = formatDate(state.date);
    elements.prevDueDate.textContent = formatDate(state.dueDate);
    elements.prevAddressee.textContent = state.addressee;
    
    // Setup honorifics (様 or Esq. or 御中)
    elements.prevHonorific.textContent = state.addresseeTitle;
    
    // Format receipt total amount
    elements.prevAmount.textContent = formatCurrency(state.totalAmount, state.currency);
    
    // Render dynamic itemized table
    const tbody = document.getElementById('prev-items-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      
      // Localized headers
      document.getElementById('lbl-col-name').textContent = state.lang === 'en' ? 'Description' : (state.lang === 'zh_CN' || state.lang === 'zh_TW' ? '明细项目 / 品名' : '品名 / 項目');
      document.getElementById('lbl-col-price').textContent = state.lang === 'en' ? 'Unit Price' : (state.lang === 'zh_CN' || state.lang === 'zh_TW' ? '单价' : '単価');
      document.getElementById('lbl-col-qty').textContent = state.lang === 'en' ? 'Qty' : (state.lang === 'zh_CN' || state.lang === 'zh_TW' ? '数量' : '数量');
      document.getElementById('lbl-col-amount').textContent = state.lang === 'en' ? 'Amount' : (state.lang === 'zh_CN' || state.lang === 'zh_TW' ? '金额' : '金額');

      state.items.forEach(item => {
        const tr = document.createElement('tr');
        
        const tdName = document.createElement('td');
        tdName.className = 'col-item-name';
        tdName.textContent = item.desc;
        
        const tdPrice = document.createElement('td');
        tdPrice.className = 'col-item-price';
        tdPrice.textContent = formatCurrency(item.price, state.currency);
        
        const tdQty = document.createElement('td');
        tdQty.className = 'col-item-qty';
        tdQty.textContent = item.qty;
        
        const tdAmount = document.createElement('td');
        tdAmount.className = 'col-item-amount';
        tdAmount.textContent = formatCurrency(item.qty * item.price, state.currency);
        
        tr.appendChild(tdName);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdAmount);
        
        tbody.appendChild(tr);
      });

      // Calculate totals for tfoot
      let totalQty = 0;
      state.items.forEach(item => {
        totalQty += (item.qty || 0);
      });
      
      const lblTotalRow = document.getElementById('lbl-total-row');
      if (lblTotalRow) {
        let totalWord = '合計';
        if (state.lang === 'en') totalWord = 'Total';
        else if (state.lang === 'zh_CN') totalWord = '合计';
        else if (state.lang === 'zh_TW') totalWord = '合計';
        lblTotalRow.textContent = totalWord;
      }
      
      const prevTotalQty = document.getElementById('prev-total-qty');
      if (prevTotalQty) {
        prevTotalQty.textContent = totalQty;
      }
      
      const prevTotalAmount = document.getElementById('prev-total-amount');
      if (prevTotalAmount) {
        prevTotalAmount.textContent = formatCurrency(state.totalAmount, state.currency);
      }
    }
    
    // Notes content (replacing newlines with <br> for HTML rendering)
    elements.prevNotes.innerHTML = state.notes.replace(/\n/g, '<br>');

    // Invoice breakdown table display toggle
    if (state.isInvoiceMode) {
      elements.prevBreakdownBox.classList.remove('hidden');
      elements.prevTaxExclusive.textContent = formatCurrency(state.totalAmount - state.taxAmount10Percent, state.currency);
      elements.prevTax10Base.textContent = formatCurrency(state.taxRate10Percent, state.currency);
      elements.prevTax10Val.textContent = formatCurrency(state.taxAmount10Percent, state.currency);
      elements.prevTax10ValDup.textContent = formatCurrency(state.taxAmount10Percent, state.currency);
      
      elements.prevIssuerRegistrationContainer.classList.remove('hidden');
      elements.prevRegistration.textContent = state.registrationNo ? state.registrationNo : '-';
    } else {
      elements.prevBreakdownBox.classList.add('hidden');
      elements.prevIssuerRegistrationContainer.classList.add('hidden');
    }

    // Issuer details
    elements.prevIssuerName.textContent = state.issuerName;
    elements.prevIssuerAddress.innerHTML = state.issuerAddress.replace(/\n/g, '<br>');
    elements.prevIssuerTel.textContent = state.issuerTel;
    elements.prevIssuerEmail.textContent = state.issuerEmail;

    // Redraw Hanko
    drawHanko();

    // Save state to localstorage for auto-recovery on refresh!
    localStorage.setItem('minshuku_receipt_state', JSON.stringify(state));
  }

  // --- Viewport Fitting (Responsive transform: scale) ---
  function updateResponsiveScale() {
    const workspace = elements.previewWorkspace;
    const wrapper = elements.receiptWrapper;
    
    // Dimensions of the receipt sheet (defined in CSS as 297mm x 210mm for Landscape, 210mm x 297mm for Portrait)
    // Convert mm to pixels roughly at 96 DPI: 297mm = 1122.5px, 210mm = 793.7px
    const isPortrait = state.layout === 'portrait';
    const targetWidth = isPortrait ? 793.7 : 1122.5;
    const targetHeight = isPortrait ? 1122.5 : 793.7;
    
    // Get padding-adjusted workspace dimensions
    const wsWidth = workspace.clientWidth - 80; // 40px padding on each side
    const wsHeight = workspace.clientHeight - 80;
    
    // Compute optimal scale factor to fit sheet in viewport
    const scaleX = wsWidth / targetWidth;
    const scaleY = wsHeight / targetHeight;
    const optimalScale = Math.min(scaleX, scaleY, 1); // Cap scale at 1.0 (no upscaling)

    // Apply scale matrix transformation
    wrapper.style.transform = `scale(${optimalScale})`;
    
    // Set explicit size of wrapper to allow scroll if scale is too small
    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.height = `${targetHeight}px`;
  }

  // --- Load Cached State if available ---
  const savedState = localStorage.getItem('minshuku_receipt_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      // Deep merge parsed settings back to state
      Object.assign(state, parsed);
      
      // Safe fallback/migration for items array
      if (!state.items || !Array.isArray(state.items)) {
        state.items = [
          { desc: '宿泊費', qty: 1, price: state.totalAmount || 110000 }
        ];
      }
    } catch (e) {
      console.warn('Failed to parse cached state. Using defaults.', e);
    }
  }

  // Start Application!
  init();
});
