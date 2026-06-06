const STORAGE_KEY = "golf-booking-demo-v1";

const teeTimes = [
  "06:00", "06:20", "06:40", "07:00", "07:20", "07:40",
  "08:00", "08:20", "08:40", "09:00", "09:20", "09:40",
  "10:00", "10:20", "10:40", "11:00", "11:20", "11:40"
];

const seedState = {
  nextBookingId: 3,
  nextCaddyId: 7,
  pricing: {
    greenFee: 1800,
    cartFee: 700,
    caddyFee: 500
  },
  caddies: [
    { id: 1, number: "C-012", name: "มะลิ", skill: "อ่านไลน์กรีนดี", phone: "081-012-1212", confirmed: true, queue: 1, jobs: 0 },
    { id: 2, number: "C-027", name: "น้ำฝน", skill: "ดูแลผู้เล่นใหม่", phone: "081-027-2727", confirmed: true, queue: 2, jobs: 1 },
    { id: 3, number: "C-036", name: "จันทร์", skill: "เดินเกมเร็ว", phone: "081-036-3636", confirmed: false, queue: 3, jobs: 0 },
    { id: 4, number: "C-044", name: "แพรว", skill: "แนะนำระยะไม้แม่น", phone: "081-044-4444", confirmed: true, queue: 4, jobs: 0 },
    { id: 5, number: "C-058", name: "อร", skill: "บริการกลุ่ม VIP", phone: "081-058-5858", confirmed: false, queue: 5, jobs: 0 },
    { id: 6, number: "C-063", name: "ดาว", skill: "ชำนาญสนามหลัง", phone: "081-063-6363", confirmed: true, queue: 6, jobs: 0 }
  ],
  bookings: [
    {
      id: 1,
      guestName: "คุณธีร์",
      guestPhone: "081-234-5678",
      playDate: getTodayISO(),
      teeTime: "07:20",
      players: "4",
      golfCarts: 2,
      caddyId: 2,
      caddyIds: [2, 1, 4, 6],
      costs: {
        greenFee: 7200,
        cartFee: 1400,
        caddyFee: 2000,
        total: 10600,
        pricing: { greenFee: 1800, cartFee: 700, caddyFee: 500 }
      },
      assignedBy: "เลือกเอง",
      status: "traveling",
      progress: 48,
      eta: 16,
      caddyAlerted: true,
      caddyAcknowledgements: { "2": true },
      caddyMetGuests: {}
    },
    {
      id: 2,
      guestName: "คุณเมย์",
      guestPhone: "089-111-4422",
      playDate: getTodayISO(),
      teeTime: "08:40",
      players: "1",
      golfCarts: 1,
      caddyId: 1,
      caddyIds: [1],
      costs: {
        greenFee: 1800,
        cartFee: 700,
        caddyFee: 500,
        total: 3000,
        pricing: { greenFee: 1800, cartFee: 700, caddyFee: 500 }
      },
      assignedBy: "ระบบจัดคิว",
      status: "confirmed",
      progress: 0,
      eta: 35,
      caddyAlerted: false,
      caddyAcknowledgements: {},
      caddyMetGuests: {}
    }
  ]
};

let state = loadState();
let trackingTimer = null;
let latestAssignment = null;
let authState = loadAuthState();
let trackingCaddyId = loadTrackingCaddyId();

const elements = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  todayLabel: document.querySelector("#todayLabel"),
  bookingForm: document.querySelector("#bookingForm"),
  caddyRegisterForm: document.querySelector("#caddyRegisterForm"),
  playDate: document.querySelector("#playDate"),
  teeTime: document.querySelector("#teeTime"),
  players: document.querySelector("#players"),
  golfCarts: document.querySelector("#golfCarts"),
  preferredCaddy: document.querySelector("#preferredCaddy"),
  bookingPricePreview: document.querySelector("#bookingPricePreview"),
  bookingSubmitBtn: document.querySelector("#bookingSubmitBtn"),
  bookingGateNotice: document.querySelector("#bookingGateNotice"),
  availableCaddies: document.querySelector("#availableCaddies"),
  guestSummarySearch: document.querySelector("#guestSummarySearch"),
  guestSummaryList: document.querySelector("#guestSummaryList"),
  guestSummaryCount: document.querySelector("#guestSummaryCount"),
  caddyRoster: document.querySelector("#caddyRoster"),
  workingCount: document.querySelector("#workingCount"),
  trackingBooking: document.querySelector("#trackingBooking"),
  trackingAccessForm: document.querySelector("#trackingAccessForm"),
  trackingCaddyNumber: document.querySelector("#trackingCaddyNumber"),
  trackingProtectedContent: document.querySelector("#trackingProtectedContent"),
  trackingLogoutBtn: document.querySelector("#trackingLogoutBtn"),
  travelProgress: document.querySelector("#travelProgress"),
  guestPin: document.querySelector("#guestPin"),
  mapEtaLabel: document.querySelector("#mapEtaLabel"),
  routeProgress: document.querySelector(".route-progress"),
  trackingDetail: document.querySelector("#trackingDetail"),
  trackingSummary: document.querySelector("#trackingSummary"),
  bookingList: document.querySelector("#bookingList"),
  latestAssignmentNotice: document.querySelector("#latestAssignmentNotice"),
  bookingMetric: document.querySelector("#bookingMetric"),
  caddyMetric: document.querySelector("#caddyMetric"),
  travelMetric: document.querySelector("#travelMetric"),
  forecastStatus: document.querySelector("#forecastStatus"),
  forecastRevenue: document.querySelector("#forecastRevenue"),
  forecastPlayers: document.querySelector("#forecastPlayers"),
  forecastCarts: document.querySelector("#forecastCarts"),
  forecastCaddyCoverage: document.querySelector("#forecastCaddyCoverage"),
  forecastCaddyNote: document.querySelector("#forecastCaddyNote"),
  forecastPeakTime: document.querySelector("#forecastPeakTime"),
  forecastSlotList: document.querySelector("#forecastSlotList"),
  forecastRiskList: document.querySelector("#forecastRiskList"),
  forecastRecommendationList: document.querySelector("#forecastRecommendationList"),
  startTripBtn: document.querySelector("#startTripBtn"),
  arriveBtn: document.querySelector("#arriveBtn"),
  demoTrackingBtn: document.querySelector("#demoTrackingBtn"),
  resetDemoBtn: document.querySelector("#resetDemoBtn"),
  resetBookingsBtn: document.querySelector("#resetBookingsBtn"),
  resetCaddiesBtn: document.querySelector("#resetCaddiesBtn"),
  resetAllBtn: document.querySelector("#resetAllBtn"),
  pricingForm: document.querySelector("#pricingForm"),
  authForms: document.querySelectorAll("[data-auth-form]"),
  protectedContent: document.querySelectorAll("[data-protected]"),
  logoutButtons: document.querySelectorAll("[data-logout]"),
  greenFeePrice: document.querySelector("#greenFeePrice"),
  cartFeePrice: document.querySelector("#cartFeePrice"),
  caddyFeePrice: document.querySelector("#caddyFeePrice"),
  pricingStatus: document.querySelector("#pricingStatus"),
  toast: document.querySelector("#toast")
};

init();

function init() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full"
  }).format(new Date());
  elements.playDate.value = getTodayISO();
  elements.teeTime.innerHTML = teeTimes.map(time => `<option value="${time}">${time} น.</option>`).join("");

  elements.tabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  elements.bookingForm.addEventListener("submit", handleBookingSubmit);
  elements.players.addEventListener("change", () => {
    renderBookingGate();
    renderBookingPricePreview();
  });
  elements.golfCarts.addEventListener("change", renderBookingPricePreview);
  elements.preferredCaddy.addEventListener("change", renderBookingGate);
  elements.guestSummarySearch.addEventListener("input", renderGuestSummary);
  elements.guestSummaryList.addEventListener("click", handleGuestSummaryAction);
  elements.caddyRegisterForm.addEventListener("submit", handleCaddyRegister);
  elements.caddyRoster.addEventListener("change", handleCaddyToggle);
  elements.bookingList.addEventListener("click", handleBookingAction);
  elements.trackingAccessForm.addEventListener("submit", handleTrackingAccessSubmit);
  elements.trackingLogoutBtn.addEventListener("click", handleTrackingLogout);
  elements.trackingDetail.addEventListener("click", handleTrackingCaddyAction);
  elements.trackingBooking.addEventListener("change", () => {
    stopTrackingDemo(false);
    renderTracking();
  });
  elements.travelProgress.addEventListener("input", handleProgressChange);
  elements.startTripBtn.addEventListener("click", () => updateTrackingStatus("traveling"));
  elements.arriveBtn.addEventListener("click", () => updateTrackingStatus("arrived"));
  elements.demoTrackingBtn.addEventListener("click", toggleTrackingDemo);
  elements.resetDemoBtn.addEventListener("click", resetDemo);
  elements.resetBookingsBtn.addEventListener("click", resetBookings);
  elements.resetCaddiesBtn.addEventListener("click", resetCaddies);
  elements.resetAllBtn.addEventListener("click", resetAllData);
  elements.pricingForm.addEventListener("submit", handlePricingSubmit);
  elements.authForms.forEach(form => {
    form.addEventListener("submit", handleAuthSubmit);
  });
  elements.logoutButtons.forEach(button => {
    button.addEventListener("click", handleLogout);
  });

  renderAll();
}

function switchTab(tabId) {
  elements.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabId));
  elements.panels.forEach(panel => panel.classList.toggle("active", panel.id === tabId));
  renderAuthGate();
}

function handleBookingSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const preferredId = Number(form.get("preferredCaddy"));
  const playerCount = Number(form.get("players"));
  const golfCarts = Number(form.get("golfCarts"));
  const selectedCaddies = selectCaddiesForBooking(playerCount, preferredId);
  const costs = calculateBookingCosts(playerCount, golfCarts, selectedCaddies.length);

  if (!selectedCaddies.length) {
    showToast("ยังไม่มีแคดดี้ที่ลงทะเบียนพร้อมทำงาน กรุณาให้แคดดี้ลงทะเบียนก่อน");
    switchTab("caddy");
    return;
  }

  if (selectedCaddies.length < playerCount) {
    showToast(`แคดดี้พร้อมงานไม่พอ ต้องการ ${playerCount} คน แต่พร้อม ${selectedCaddies.length} คน`);
    switchTab("caddy");
    return;
  }

  const booking = {
    id: state.nextBookingId++,
    guestName: form.get("guestName").trim(),
    guestPhone: form.get("guestPhone").trim(),
    playDate: form.get("playDate"),
    teeTime: form.get("teeTime"),
    players: String(playerCount),
    golfCarts,
    caddyId: selectedCaddies[0].id,
    caddyIds: selectedCaddies.map(caddy => caddy.id),
    costs,
    assignedBy: getAssignedByText(preferredId, playerCount),
    status: "confirmed",
    progress: 0,
    eta: 35,
    caddyAlerted: false,
    caddyAcknowledgements: {},
    caddyMetGuests: {}
  };

  assignCaddiesToBooking(selectedCaddies);
  state.bookings.push(booking);
  latestAssignment = {
    guestName: booking.guestName,
    teeTime: booking.teeTime,
    caddyName: formatCaddyNames(selectedCaddies),
    caddyNumber: formatCaddyNumbers(selectedCaddies),
    assignedBy: booking.assignedBy
  };
  saveState();
  event.currentTarget.reset();
  elements.playDate.value = getTodayISO();
  showToast(getAssignmentToast(booking, selectedCaddies));
  renderAll();
  elements.guestSummarySearch.value = booking.guestPhone;
  renderGuestSummary();
  switchTab("guest-summary");
}

function handleCaddyRegister(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const number = normalizeCaddyNumber(form.get("caddyNumber"));
  const existing = state.caddies.find(caddy => caddy.number.toLowerCase() === number.toLowerCase());

  if (existing) {
    existing.name = form.get("caddyName").trim();
    existing.skill = form.get("caddySkill").trim();
    existing.phone = form.get("caddyPhone").trim();
    existing.confirmed = form.get("caddyConfirmed") === "on";
    existing.queue = existing.confirmed ? getNextQueue() : existing.queue || getNextQueue();
    showToast(`${existing.number} อัปเดตข้อมูลและสถานะแล้ว`);
  } else {
    state.caddies.push({
      id: state.nextCaddyId++,
      number,
      name: form.get("caddyName").trim(),
      skill: form.get("caddySkill").trim(),
      phone: form.get("caddyPhone").trim(),
      confirmed: form.get("caddyConfirmed") === "on",
      queue: getNextQueue(),
      jobs: 0
    });
    showToast(`${number} ลงทะเบียนเข้าทำงานแล้ว`);
  }

  saveState();
  event.currentTarget.reset();
  document.querySelector("#caddyConfirmed").checked = true;
  renderAll();
}

function handlePricingSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.pricing = {
    greenFee: Number(form.get("greenFee")),
    cartFee: Number(form.get("cartFee")),
    caddyFee: Number(form.get("caddyFee"))
  };
  saveState();
  renderAll();
  showToast("บันทึกราคาค่าบริการแล้ว");
  switchTab("booking");
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const area = event.currentTarget.dataset.authForm;
  const form = new FormData(event.currentTarget);
  const username = String(form.get("username")).trim();
  const password = String(form.get("password")).trim();

  if (username !== "admin" || password !== "admin") {
    showToast("User หรือ Password ไม่ถูกต้อง");
    return;
  }

  authState[area] = true;
  saveAuthState();
  event.currentTarget.reset();
  renderAuthGate();
  showToast("เข้าสู่ระบบสำเร็จ");
}

function handleLogout(event) {
  const area = event.currentTarget.dataset.logout;
  authState[area] = false;
  saveAuthState();
  renderAuthGate();
  showToast("ออกจากระบบแล้ว");
}

function handleCaddyToggle(event) {
  if (!event.target.matches("[data-caddy-toggle]")) return;
  const caddy = getCaddy(Number(event.target.dataset.caddyToggle));
  caddy.confirmed = event.target.checked;
  if (caddy.confirmed) {
    caddy.queue = getNextQueue(caddy.id);
  }
  saveState();
  renderAll();
  showToast(caddy.confirmed ? `${caddy.number} ยืนยันเข้าทำงานแล้ว` : `${caddy.number} ปิดสถานะพร้อมทำงาน`);
}

function handleBookingAction(event) {
  const action = event.target.dataset.action;
  const id = Number(event.target.dataset.bookingId);
  if (!action || !id) return;
  const booking = getBooking(id);

  if (action === "tracking") {
    elements.trackingBooking.value = String(id);
    renderTracking();
    switchTab("tracking");
  }

  if (action === "cancel") {
    state.bookings = state.bookings.filter(item => item.id !== id);
    saveState();
    renderAll();
    showToast(`ยกเลิกรายการจองของ ${booking.guestName} แล้ว`);
  }
}

function handleGuestSummaryAction(event) {
  const id = Number(event.target.dataset.summaryTrackingId);
  if (!id) return;
  elements.trackingBooking.value = String(id);
  renderTracking();
  switchTab("tracking");
}

function handleTrackingAccessSubmit(event) {
  event.preventDefault();
  const number = normalizeCaddyNumber(elements.trackingCaddyNumber.value);
  const caddy = state.caddies.find(item => item.number.toLowerCase() === number.toLowerCase());

  if (!caddy) {
    showToast("ไม่พบเบอร์แคดดี้นี้ในระบบ");
    return;
  }

  const visibleBookings = state.bookings.filter(booking => getBookingCaddyIds(booking).includes(caddy.id));
  if (!visibleBookings.length) {
    showToast(`${caddy.number} ยังไม่มีรายการจองที่ได้รับมอบหมาย`);
    return;
  }

  trackingCaddyId = caddy.id;
  saveTrackingCaddyId();
  elements.trackingCaddyNumber.value = "";
  renderAll();
  showToast(`แสดง Tracking สำหรับ ${caddy.number} ${caddy.name}`);
}

function handleTrackingLogout() {
  stopTrackingDemo(false);
  trackingCaddyId = null;
  saveTrackingCaddyId();
  renderAll();
  showToast("ออกจาก Tracking แล้ว");
}

function handleTrackingCaddyAction(event) {
  const action = event.target.dataset.trackingCaddyAction;
  if (!action) return;

  const booking = getSelectedTrackingBooking();
  const caddy = getTrackingCaddy();
  if (!booking || !caddy || !getBookingCaddyIds(booking).includes(caddy.id)) {
    showToast("ไม่มีสิทธิ์อัปเดตรายการนี้");
    return;
  }

  booking.caddyAcknowledgements = booking.caddyAcknowledgements || {};
  booking.caddyMetGuests = booking.caddyMetGuests || {};

  if (action === "acknowledge") {
    booking.caddyAcknowledgements[caddy.id] = true;
    saveState();
    renderAll();
    showToast(`${caddy.number} รับทราบว่าผู้จองกำลังมาใกล้ถึงแล้ว`);
  }

  if (action === "met") {
    booking.caddyAcknowledgements[caddy.id] = true;
    booking.caddyMetGuests[caddy.id] = true;
    if (areAllAssignedCaddiesMet(booking)) {
      booking.status = "met";
      booking.progress = 100;
      booking.eta = 0;
    }
    saveState();
    renderAll();
    showToast(`ยืนยันแล้ว: ${caddy.number} ${caddy.name} เจอผู้จอง ${booking.guestName} แล้ว`);
  }
}

function handleProgressChange() {
  stopTrackingDemo(false);
  const booking = getSelectedTrackingBooking();
  if (!booking) return;
  setBookingProgress(booking, Number(elements.travelProgress.value));
  saveState();
  renderAll();
}

function updateTrackingStatus(status) {
  const booking = getSelectedTrackingBooking();
  if (!booking) {
    showToast("ยังไม่มีรายการจองให้ติดตาม");
    return;
  }

  booking.status = status;
  if (status === "traveling") {
    booking.progress = Math.max(15, booking.progress);
    booking.eta = Math.max(8, booking.eta);
    checkCaddyArrivalAlert(booking, true);
  }
  if (status === "arrived") {
    booking.progress = 100;
    booking.eta = 0;
    stopTrackingDemo(false);
  }

  saveState();
  renderAll();
  showToast(status === "arrived" ? "อัปเดตสถานะ: ผู้จองถึงสนามแล้ว" : "อัปเดตสถานะ: ผู้จองเริ่มเดินทาง");
}

function toggleTrackingDemo() {
  if (trackingTimer) {
    stopTrackingDemo(true);
    return;
  }

  const booking = getSelectedTrackingBooking();
  if (!booking) {
    showToast("ยังไม่มีรายการจองให้ทดลอง Tracking");
    return;
  }

  if (booking.progress >= 100) {
    setBookingProgress(booking, 0);
  }

  booking.status = "traveling";
  saveState();
  renderAll();
  elements.demoTrackingBtn.textContent = "หยุด Demo Realtime";
  elements.demoTrackingBtn.classList.add("running");
  showToast("เริ่ม Demo Realtime Tracking แล้ว");

  trackingTimer = window.setInterval(() => {
    const activeBooking = getSelectedTrackingBooking();
    if (!activeBooking) {
      stopTrackingDemo(false);
      return;
    }

    const nextProgress = Math.min(100, activeBooking.progress + randomStep());
    setBookingProgress(activeBooking, nextProgress);
    saveState();
    renderAll();

    if (activeBooking.progress >= 100) {
      stopTrackingDemo(false);
      renderAll();
      showToast("Demo Tracking: ผู้จองถึงสนามแล้ว");
    }
  }, 1000);
}

function stopTrackingDemo(showMessage) {
  if (!trackingTimer) return;
  window.clearInterval(trackingTimer);
  trackingTimer = null;
  elements.demoTrackingBtn.textContent = "เปิด Demo Realtime";
  elements.demoTrackingBtn.classList.remove("running");
  if (showMessage) showToast("หยุด Demo Realtime Tracking แล้ว");
}

function pickQueueCaddy() {
  return state.caddies
    .filter(caddy => caddy.confirmed)
    .sort((a, b) => a.queue - b.queue)[0];
}

function selectCaddiesForBooking(playerCount, preferredId) {
  const readyCaddies = getReadyCaddiesInQueue();
  if (!readyCaddies.length) return [];
  const selected = [];

  if (preferredId) {
    const preferredCaddy = readyCaddies.find(caddy => caddy.id === preferredId);
    if (!preferredCaddy) return [];
    selected.push(preferredCaddy);
  }

  readyCaddies.forEach(caddy => {
    if (selected.length >= playerCount) return;
    if (!selected.some(selectedCaddy => selectedCaddy.id === caddy.id)) {
      selected.push(caddy);
    }
  });

  return selected;
}

function assignCaddiesToBooking(caddies) {
  const maxQueue = getNextQueue();
  caddies.forEach((caddy, index) => {
    caddy.jobs += 1;
    caddy.confirmed = false;
    caddy.queue = maxQueue + index;
  });
  normalizeCaddyQueue();
}

function setBookingProgress(booking, progress) {
  booking.progress = Math.max(0, Math.min(100, Math.round(progress)));
  booking.status = booking.progress >= 100 ? "arrived" : "traveling";
  booking.eta = Math.max(0, Math.round((100 - booking.progress) * 0.45));
  checkCaddyArrivalAlert(booking, true);
}

function randomStep() {
  return Math.floor(Math.random() * 8) + 5;
}

function renderAll() {
  renderAuthGate();
  renderTrackingGate();
  renderAdminPricing();
  renderPreferredCaddyOptions();
  renderBookingGate();
  renderBookingPricePreview();
  renderAvailableCaddies();
  renderGuestSummary();
  renderCaddyRoster();
  renderDashboard();
  renderForecast();
  renderTrackingOptions();
  renderTracking();
}

function renderTrackingGate() {
  const hasAccess = Boolean(getTrackingCaddy());
  elements.trackingAccessForm.classList.toggle("hidden", hasAccess);
  elements.trackingProtectedContent.classList.toggle("hidden", !hasAccess);
  elements.trackingLogoutBtn.classList.toggle("hidden", !hasAccess);

  if (!hasAccess) {
    elements.trackingSummary.textContent = "ยืนยันเบอร์แคดดี้ก่อนดู Tracking";
  }
}

function renderAuthGate() {
  elements.authForms.forEach(form => {
    const area = form.dataset.authForm;
    form.classList.toggle("hidden", Boolean(authState[area]));
  });
  elements.protectedContent.forEach(content => {
    const area = content.dataset.protected;
    content.classList.toggle("hidden", !authState[area]);
  });
  elements.logoutButtons.forEach(button => {
    const area = button.dataset.logout;
    button.classList.toggle("hidden", !authState[area]);
  });
}

function renderPreferredCaddyOptions() {
  const readyCaddies = getReadyCaddiesInQueue();
  const options = [
    `<option value="">ไม่เลือก ให้ระบบจัดคิวอัตโนมัติ</option>`,
    ...readyCaddies.map(caddy => (
      `<option value="${caddy.id}">คิว ${getQueueRank(caddy.id)} • ${caddy.number} - ${caddy.name} (${caddy.skill})</option>`
    ))
  ];
  elements.preferredCaddy.innerHTML = options.join("");
}

function renderBookingGate() {
  const readyCount = getReadyCaddiesInQueue().length;
  const playerCount = Number(elements.players.value || 1);
  const shortage = Math.max(0, playerCount - readyCount);

  if (!readyCount) {
    elements.bookingSubmitBtn.disabled = true;
    elements.bookingGateNotice.className = "booking-gate blocked";
    elements.bookingGateNotice.textContent = "ยังไม่เปิดรับจอง: ต้องมีแคดดี้ลงทะเบียนพร้อมทำงานก่อน";
    return;
  }

  if (shortage > 0) {
    elements.bookingSubmitBtn.disabled = true;
    elements.bookingGateNotice.className = "booking-gate blocked";
    elements.bookingGateNotice.textContent = `แคดดี้ไม่เพียงพอ: ผู้เล่น ${playerCount} คน แต่มีแคดดี้พร้อมงาน ${readyCount} คน ต้องเพิ่มอีก ${shortage} คน`;
    return;
  }

  elements.bookingSubmitBtn.disabled = false;
  elements.bookingGateNotice.className = "booking-gate ready";
  elements.bookingGateNotice.textContent = `พร้อมรับจอง: มีแคดดี้ลงทะเบียนพร้อมงาน ${readyCount} คน เพียงพอกับผู้เล่น ${playerCount} คน`;
}

function renderBookingPricePreview() {
  const playerCount = Number(elements.players.value || 1);
  const golfCarts = Number(elements.golfCarts.value || 0);
  const readyCount = getReadyCaddiesInQueue().length;
  const shortage = Math.max(0, playerCount - readyCount);

  if (!readyCount) {
    elements.bookingPricePreview.className = "price-preview unavailable";
    elements.bookingPricePreview.innerHTML = `
      <strong>ยังคำนวณค่าใช้จ่ายไม่ได้</strong>
      <div class="meta">ต้องมีแคดดี้ลงทะเบียนพร้อมทำงานก่อน ระบบจึงจะคำนวณยอดจองได้</div>
    `;
    return;
  }

  if (shortage > 0) {
    elements.bookingPricePreview.className = "price-preview unavailable";
    elements.bookingPricePreview.innerHTML = `
      <strong>ยังคำนวณค่าใช้จ่ายไม่ได้</strong>
      <div class="meta">แคดดี้พร้อมงานไม่พอสำหรับผู้เล่น ${playerCount} คน ต้องเพิ่มอีก ${shortage} คนก่อนยืนยันราคา</div>
    `;
    return;
  }

  const costs = calculateBookingCosts(playerCount, golfCarts, playerCount);
  elements.bookingPricePreview.className = "price-preview";
  elements.bookingPricePreview.innerHTML = `
    <strong>ประมาณการค่าใช้จ่าย</strong>
    <div class="price-row"><span>ค่ากรีนฟี ${formatCurrency(state.pricing.greenFee)} x ${playerCount}</span><b>${formatCurrency(costs.greenFee)}</b></div>
    <div class="price-row"><span>ค่ารถกอล์ฟ ${formatCurrency(state.pricing.cartFee)} x ${golfCarts}</span><b>${formatCurrency(costs.cartFee)}</b></div>
    <div class="price-row"><span>ค่าแคดดี้ ${formatCurrency(state.pricing.caddyFee)} x ${playerCount}</span><b>${formatCurrency(costs.caddyFee)}</b></div>
    <div class="price-row total"><span>ยอดรวม</span><b>${formatCurrency(costs.total)}</b></div>
  `;
}

function renderAdminPricing() {
  elements.greenFeePrice.value = state.pricing.greenFee;
  elements.cartFeePrice.value = state.pricing.cartFee;
  elements.caddyFeePrice.value = state.pricing.caddyFee;
  elements.pricingStatus.textContent = `รวมตัวอย่าง 1 คน + รถ 1 คัน: ${formatCurrency(calculateBookingCosts(1, 1, 1).total)}`;
}

function renderAvailableCaddies() {
  const readyCaddies = getReadyCaddiesInQueue();
  if (!readyCaddies.length) {
    elements.availableCaddies.innerHTML = `<div class="empty-state">ยังไม่มีแคดดี้กดยืนยันเข้าทำงาน</div>`;
    return;
  }

  elements.availableCaddies.innerHTML = readyCaddies
    .map(caddy => `
      <article class="caddy-card">
        <div class="caddy-top">
          <div class="name-line">
            <span class="queue-badge">${getQueueRank(caddy.id)}</span>
            <div>
              <strong>${caddy.number} ${caddy.name}</strong>
              <span class="meta">${caddy.skill}</span>
            </div>
          </div>
          <span class="pill ready">พร้อม</span>
        </div>
        <div class="meta">งานวันนี้ ${caddy.jobs} รอบ • ลำดับรับงานคิวที่ ${getQueueRank(caddy.id)}</div>
      </article>
    `)
    .join("");
}

function renderCaddyRoster() {
  const working = state.caddies.filter(caddy => caddy.confirmed).length;
  elements.workingCount.textContent = `${working} คนพร้อมทำงาน`;
  elements.caddyRoster.innerHTML = state.caddies
  .slice()
  .sort((a, b) => a.queue - b.queue)
  .map(caddy => {
    const alertBookings = getAlertBookingsForCaddy(caddy.id);
    const bookedOut = !caddy.confirmed && caddy.jobs > 0;
    const statusLabel = caddy.confirmed ? "พร้อมงาน" : bookedOut ? "ถูกจองแล้ว" : "ยังไม่เช็กอิน";
    const queueText = caddy.confirmed
      ? `คิวรับงานที่ ${getQueueRank(caddy.id)}`
      : bookedOut ? "ออกจากคิวพร้อมจองแล้ว ต้องลงทะเบียนใหม่หากรับงานรอบถัดไป" : "ยังไม่อยู่ในคิวรับงาน";
    return `
      <article class="caddy-card">
        <div class="caddy-top">
          <div class="name-line">
            <span class="queue-badge">${caddy.confirmed ? getQueueRank(caddy.id) : "-"}</span>
            <div>
              <strong>${caddy.number} ${caddy.name}</strong>
              <span class="meta">${caddy.skill}</span>
            </div>
          </div>
          <span class="pill ${caddy.confirmed ? "ready" : bookedOut ? "busy" : ""}">${statusLabel}</span>
        </div>
        <label class="work-toggle">
          ${bookedOut ? "ต้องลงทะเบียนใหม่เพื่อรับงานรอบถัดไป" : "ยืนยันทำงานวันนี้"}
          <input data-caddy-toggle="${caddy.id}" type="checkbox" ${caddy.confirmed ? "checked" : ""} ${bookedOut ? "disabled" : ""}>
        </label>
        <div class="meta">รอบที่ได้รับ ${caddy.jobs} • ${queueText} ${caddy.phone ? `• ${caddy.phone}` : ""}</div>
        ${alertBookings.map(booking => `
          <div class="arrival-alert compact-alert">
            <strong>เตรียมไปรอผู้จอง</strong>
            <span>${booking.guestName} จะถึงในประมาณ ${booking.eta} นาที • Tee time ${booking.teeTime} น.</span>
          </div>
        `).join("")}
      </article>
    `;
  }).join("");
}

function renderDashboard() {
  const todayBookings = state.bookings
    .slice()
    .sort((a, b) => a.playDate.localeCompare(b.playDate) || a.teeTime.localeCompare(b.teeTime) || a.id - b.id);
  const traveling = state.bookings.filter(booking => booking.status === "traveling").length;

  elements.bookingMetric.textContent = state.bookings.length;
  elements.caddyMetric.textContent = state.caddies.filter(caddy => caddy.confirmed).length;
  elements.travelMetric.textContent = traveling;
  renderLatestAssignmentNotice();

  if (!todayBookings.length) {
    elements.bookingList.innerHTML = `<div class="empty-state">ยังไม่มีรายการจอง</div>`;
    return;
  }

  elements.bookingList.innerHTML = todayBookings.map((booking, index) => {
    const caddies = getBookingCaddies(booking);
    const caddyLabel = caddies.length ? formatCaddyLabels(caddies) : "ไม่พบข้อมูลแคดดี้";
    const assignmentText = getAssignmentText(booking, caddies);
    const alertMarkup = shouldAlertCaddy(booking) ? `
      <div class="arrival-alert">
        <strong>แจ้งเตือนแคดดี้: เตรียมมารอผู้จอง</strong>
        <span>ผู้จองจะถึงสนามในประมาณ ${booking.eta} นาที</span>
      </div>
    ` : "";
    const metNotice = renderCaddyMetNotice(booking);
    return `
      <article class="booking-card">
        <div class="booking-top">
          <div class="overview-title">
            <span class="overview-rank">ลำดับ ${index + 1}</span>
            <div>
              <strong>${booking.teeTime} น. • ${booking.guestName}</strong>
              <span class="meta">${formatThaiDate(booking.playDate)} • ${booking.players} ผู้เล่น • ${booking.guestPhone}</span>
            </div>
          </div>
          <span class="pill ${booking.status}">${statusText(booking.status)}</span>
        </div>
        <div class="meta">แคดดี้: ${caddyLabel} • ${booking.assignedBy} • ETA ${booking.eta} นาที</div>
        ${renderCostSummary(booking)}
        <div class="assignment-notice">
          <strong>แจ้งผู้จองแล้ว</strong>
          <span>${assignmentText}</span>
        </div>
        ${alertMarkup}
        ${metNotice}
        <div class="booking-actions">
          <button class="secondary-button" data-action="tracking" data-booking-id="${booking.id}" type="button">ดู Tracking</button>
          <button class="ghost-button" data-action="cancel" data-booking-id="${booking.id}" type="button">ยกเลิก</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderForecast() {
  const bookings = state.bookings
    .slice()
    .sort((a, b) => a.playDate.localeCompare(b.playDate) || a.teeTime.localeCompare(b.teeTime) || a.id - b.id);
  const readyCaddies = state.caddies.filter(caddy => caddy.confirmed).length;
  const assignedCaddyCount = new Set(bookings.flatMap(booking => getBookingCaddyIds(booking))).size;
  const totalPlayers = bookings.reduce((sum, booking) => sum + Number(booking.players || 0), 0);
  const totalCarts = bookings.reduce((sum, booking) => sum + Number(booking.golfCarts || 0), 0);
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(getBookingCosts(booking).total || 0), 0);
  const caddyShortage = Math.max(0, totalPlayers - assignedCaddyCount);

  elements.forecastStatus.textContent = bookings.length ? `Forecast ${bookings.length} รายการ` : "ยังไม่มีข้อมูลจอง";
  elements.forecastRevenue.textContent = formatCurrency(totalRevenue);
  elements.forecastPlayers.textContent = `${totalPlayers} คน`;
  elements.forecastCarts.textContent = `${totalCarts} คัน`;
  elements.forecastCaddyCoverage.textContent = `${readyCaddies} คน`;
  elements.forecastCaddyNote.textContent = bookings.length
    ? `จัดให้ booking แล้ว ${assignedCaddyCount} คน เหลือพร้อมรับจองใหม่ ${readyCaddies} คน`
    : `มีแคดดี้พร้อมรับจอง ${readyCaddies} คน`;

  renderForecastSlots(bookings);
  renderForecastRisks(bookings, caddyShortage);
}

function renderForecastSlots(bookings) {
  if (!bookings.length) {
    elements.forecastPeakTime.textContent = "ยังไม่มีรายการจอง";
    elements.forecastSlotList.innerHTML = `<div class="empty-state">ยังไม่มีข้อมูลสำหรับคาดการณ์ช่วงเวลา</div>`;
    return;
  }

  const slotMap = bookings.reduce((map, booking) => {
    const key = `${booking.playDate} ${booking.teeTime}`;
    if (!map.has(key)) {
      map.set(key, {
        playDate: booking.playDate,
        teeTime: booking.teeTime,
        bookings: 0,
        players: 0,
        carts: 0,
        revenue: 0
      });
    }
    const slot = map.get(key);
    slot.bookings += 1;
    slot.players += Number(booking.players || 0);
    slot.carts += Number(booking.golfCarts || 0);
    slot.revenue += Number(getBookingCosts(booking).total || 0);
    return map;
  }, new Map());

  const slots = Array.from(slotMap.values())
    .sort((a, b) => b.players - a.players || a.playDate.localeCompare(b.playDate) || a.teeTime.localeCompare(b.teeTime));
  const peak = slots[0];

  elements.forecastPeakTime.innerHTML = `
    <strong>${formatThaiDate(peak.playDate)} • ${peak.teeTime} น.</strong>
    <span>เป็นช่วงที่มีภาระงานสูงสุดตอนนี้: ${peak.bookings} booking, ${peak.players} ผู้เล่น, ต้องเตรียมรถกอล์ฟ ${peak.carts} คัน และคาดรายได้ ${formatCurrency(peak.revenue)}</span>
  `;

  elements.forecastSlotList.innerHTML = slots.map((slot, index) => `
    <article class="forecast-row">
      <span class="overview-rank">ลำดับ ${index + 1}</span>
      <div>
        <strong>${slot.teeTime} น. • ${formatThaiDate(slot.playDate)}</strong>
        <span>มี ${slot.bookings} booking รวม ${slot.players} ผู้เล่น ต้องเตรียมรถกอล์ฟ ${slot.carts} คัน รายได้ช่วงนี้ประมาณ ${formatCurrency(slot.revenue)}</span>
        <em>${getSlotAdvice(slot)}</em>
      </div>
    </article>
  `).join("");
}

function renderForecastRisks(bookings, caddyShortage) {
  const risks = bookings
    .filter(booking => (
      shouldAlertCaddy(booking)
      || (booking.status === "confirmed" && Number(booking.eta || 0) <= 35)
      || getBookingCaddyIds(booking).length < Number(booking.players || 1)
    ))
    .sort((a, b) => Number(a.eta || 99) - Number(b.eta || 99));

  elements.forecastRiskList.innerHTML = risks.length
    ? risks.map(booking => {
      const caddies = getBookingCaddies(booking);
      const reason = getForecastRiskReason(booking);
      return `
        <article class="forecast-row risk">
          <span class="pill ${booking.status}">${statusText(booking.status)}</span>
          <div>
            <strong>${booking.guestName} • ${booking.teeTime} น.</strong>
            <span>${reason}</span>
            <em>ETA ${booking.eta} นาที • ${booking.players} ผู้เล่น • รถ ${booking.golfCarts || 0} คัน • แคดดี้ ${caddies.length ? formatCaddyNumbers(caddies) : "ยังไม่ครบ"}</em>
          </div>
        </article>
      `;
    }).join("")
    : `<div class="empty-state">ยังไม่มีรายการเสี่ยงที่ต้องติดตามพิเศษ</div>`;

  const recommendations = [];
  if (caddyShortage) recommendations.push(`เรียกแคดดี้เพิ่มอย่างน้อย ${caddyShortage} คน เพื่อรองรับจำนวนผู้เล่นรวม`);
  if (bookings.some(booking => shouldAlertCaddy(booking))) recommendations.push("มีผู้จองใกล้ถึงสนาม ควรให้แคดดี้กดยืนยันรับทราบและเตรียมรอ");
  if (bookings.reduce((sum, booking) => sum + Number(booking.golfCarts || 0), 0) >= 4) recommendations.push("ตรวจความพร้อมรถกอล์ฟก่อนช่วงพีค");
  if (!recommendations.length) recommendations.push("สถานการณ์โดยรวมปกติ ยังไม่พบความเสี่ยงสำคัญจากข้อมูลปัจจุบัน");

  elements.forecastRecommendationList.innerHTML = recommendations.map(item => `
    <div class="forecast-advice">${item}</div>
  `).join("");
}

function getSlotAdvice(slot) {
  if (slot.players >= 4) return "ข้อแนะนำ: เตรียมแคดดี้และรถกอล์ฟล่วงหน้า เพราะเป็นช่วงที่มีผู้เล่นหลายคน";
  if (slot.carts >= 2) return "ข้อแนะนำ: ตรวจสถานะรถกอล์ฟก่อนถึงเวลาออกรอบ";
  return "ข้อแนะนำ: ภาระงานช่วงนี้ยังไม่สูงมาก สามารถใช้คิวแคดดี้ปกติได้";
}

function getForecastRiskReason(booking) {
  const assignedCount = getBookingCaddyIds(booking).length;
  const playerCount = Number(booking.players || 1);
  if (assignedCount < playerCount) {
    return `แคดดี้ยังไม่ครบ: ต้องใช้ ${playerCount} คน แต่มีในรายการ ${assignedCount} คน`;
  }
  if (shouldAlertCaddy(booking)) {
    return `ผู้จองกำลังใกล้ถึงสนาม ควรให้แคดดี้รับทราบและเตรียมรอ`;
  }
  if (booking.status === "confirmed" && Number(booking.eta || 0) <= 35) {
    return `รายการนี้ใกล้ช่วงแจ้งเตือน 30 นาที ควรตรวจความพร้อมของแคดดี้`;
  }
  return "ควรติดตามสถานะเพื่อให้การรับผู้จองไม่สะดุด";
}


function renderGuestSummary() {
  const query = elements.guestSummarySearch.value.trim().toLowerCase();
  const bookings = state.bookings
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter(booking => {
      if (!query) return true;
      return booking.guestName.toLowerCase().includes(query) || booking.guestPhone.toLowerCase().includes(query);
    });

  elements.guestSummaryCount.textContent = bookings.length ? `${bookings.length} รายการ` : "ยังไม่มีรายการจอง";

  if (!bookings.length) {
    elements.guestSummaryList.innerHTML = `<div class="empty-state">ยังไม่พบรายการจองของผู้จอง</div>`;
    return;
  }

  elements.guestSummaryList.innerHTML = bookings.map(booking => {
    const caddies = getBookingCaddies(booking);
    const caddyLabel = caddies.length ? formatCaddyLabels(caddies) : "ไม่พบข้อมูลแคดดี้";
    const caddySkill = caddies.length ? caddies.map(caddy => `${caddy.number}: ${caddy.skill}`).join(", ") : "-";
    const caddyPhone = caddies.length ? caddies.map(caddy => `${caddy.number}: ${caddy.phone || "-"}`).join(", ") : "-";
    return `
      <article class="summary-card">
        <div class="summary-hero">
          <div>
            <h3>ยืนยันการจองสำเร็จ</h3>
            <div class="meta">${getAssignmentText(booking, caddies)}</div>
          </div>
          <span class="summary-code">GB-${String(booking.id).padStart(4, "0")}</span>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span>ผู้จอง</span>
            <strong>${booking.guestName}</strong>
          </div>
          <div class="summary-item">
            <span>วันที่และเวลา</span>
            <strong>${formatThaiDate(booking.playDate)} • ${booking.teeTime} น.</strong>
          </div>
          <div class="summary-item">
            <span>จำนวนผู้เล่น</span>
            <strong>${booking.players} คน</strong>
          </div>
          <div class="summary-item">
            <span>รถกอล์ฟ</span>
            <strong>${booking.golfCarts || 0} คัน</strong>
          </div>
          <div class="summary-item">
            <span>แคดดี้ที่ได้รับ</span>
            <strong>${caddyLabel}</strong>
          </div>
          <div class="summary-item">
            <span>ความถนัดแคดดี้</span>
            <strong>${caddySkill}</strong>
          </div>
          <div class="summary-item">
            <span>ติดต่อแคดดี้</span>
            <strong>${caddyPhone}</strong>
          </div>
          <div class="summary-item">
            <span>วิธีจัดแคดดี้</span>
            <strong>${booking.assignedBy}</strong>
          </div>
          <div class="summary-item">
            <span>สถานะ</span>
            <strong>${statusText(booking.status)}</strong>
          </div>
          <div class="summary-item">
            <span>ETA</span>
            <strong>${booking.eta} นาที</strong>
          </div>
          <div class="summary-item price-total-item">
            <span>ยอดรวมค่าใช้จ่าย</span>
            <strong>${formatCurrency(getBookingCosts(booking).total)}</strong>
          </div>
        </div>

        ${renderCostSummary(booking)}
        ${renderCaddyMetNotice(booking)}

        <div class="booking-actions">
          <button class="secondary-button" data-summary-tracking-id="${booking.id}" type="button">ดู Tracking</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderLatestAssignmentNotice() {
  if (!latestAssignment) {
    elements.latestAssignmentNotice.classList.add("hidden");
    elements.latestAssignmentNotice.innerHTML = "";
    return;
  }

  const prefix = latestAssignment.assignedBy === "ระบบจัดคิว"
    ? "ระบบเลือกแคดดี้ให้ผู้จองแล้ว"
    : "บันทึกแคดดี้ที่ผู้จองเลือกแล้ว";
  elements.latestAssignmentNotice.classList.remove("hidden");
  elements.latestAssignmentNotice.innerHTML = `
    <strong>${prefix}</strong>
    <span>${latestAssignment.guestName} เวลา ${latestAssignment.teeTime} น. ได้แคดดี้ ${latestAssignment.caddyNumber} ${latestAssignment.caddyName}</span>
  `;
}

function renderTrackingOptions() {
  const currentValue = elements.trackingBooking.value;
  const visibleBookings = getTrackingVisibleBookings();
  if (!getTrackingCaddy()) {
    elements.trackingBooking.innerHTML = `<option value="">กรุณายืนยันเบอร์แคดดี้</option>`;
    return;
  }
  if (!visibleBookings.length) {
    elements.trackingBooking.innerHTML = `<option value="">ไม่มีรายการที่ได้รับมอบหมาย</option>`;
    return;
  }

  elements.trackingBooking.innerHTML = visibleBookings
    .slice()
    .sort((a, b) => a.teeTime.localeCompare(b.teeTime))
    .map(booking => {
      const caddies = getBookingCaddies(booking);
      return `<option value="${booking.id}">${booking.teeTime} ${booking.guestName} • ${caddies.length ? formatCaddyNumbers(caddies) : "ไม่มีแคดดี้"}</option>`;
    })
    .join("");

  if (currentValue && visibleBookings.some(booking => booking.id === Number(currentValue))) {
    elements.trackingBooking.value = currentValue;
  }
}

function renderTracking() {
  if (!getTrackingCaddy()) {
    elements.trackingDetail.innerHTML = `<div class="empty-state">กรุณายืนยันเบอร์แคดดี้ก่อนดูข้อมูลผู้จอง</div>`;
    updatePin(0);
    return;
  }

  const booking = getSelectedTrackingBooking();
  if (!booking) {
    elements.trackingDetail.innerHTML = `<div class="empty-state">ไม่มีรายการ Tracking ที่แคดดี้คนนี้ได้รับมอบหมาย</div>`;
    elements.trackingSummary.textContent = "ไม่มีรายการที่ได้รับมอบหมาย";
    updatePin(0);
    return;
  }

  const caddies = getBookingCaddies(booking);
  const trackingCaddy = getTrackingCaddy();
  const caddyWorkflowMarkup = renderCaddyTrackingWorkflow(booking, trackingCaddy);
  const alertMarkup = shouldAlertCaddy(booking) ? `
    <div class="arrival-alert">
      <strong>แจ้งเตือนแคดดี้แล้ว</strong>
      <span>${caddies.length ? formatCaddyLabels(caddies) : "แคดดี้"} ควรเตรียมมารอผู้จอง เพราะ ETA เหลือประมาณ ${booking.eta} นาที</span>
    </div>
  ` : "";
  elements.travelProgress.value = booking.progress;
  updatePin(booking.progress);
  elements.trackingSummary.textContent = `${booking.guestName}: ${statusText(booking.status)}`;
  elements.trackingDetail.innerHTML = `
    <h3>${booking.guestName}</h3>
    ${alertMarkup}
    ${caddyWorkflowMarkup}
    <div class="detail-row"><span>เวลาออกรอบ</span><strong>${booking.teeTime} น.</strong></div>
    <div class="detail-row"><span>แคดดี้</span><strong>${caddies.length ? formatCaddyLabels(caddies) : "ไม่พบข้อมูลแคดดี้"}</strong></div>
    <div class="detail-row"><span>สถานะ</span><strong>${statusText(booking.status)}</strong></div>
    <div class="detail-row"><span>รถกอล์ฟ</span><strong>${booking.golfCarts || 0} คัน</strong></div>
    <div class="detail-row"><span>ยอดรวม</span><strong>${formatCurrency(getBookingCosts(booking).total)}</strong></div>
    <div class="detail-row"><span>ETA</span><strong>${booking.eta} นาที</strong></div>
    <div class="detail-row"><span>ความคืบหน้า</span><strong>${booking.progress}%</strong></div>
    <div class="detail-row"><span>Realtime Demo</span><strong class="${trackingTimer ? "live-dot" : ""}">${trackingTimer ? "กำลังอัปเดตสด" : "พร้อมทดลอง"}</strong></div>
    <p class="hint">แคดดี้สามารถดู ETA และสถานะนี้เพื่อเตรียมตัวใกล้เวลาที่ผู้จองจะมาถึง โดยไม่ต้องนั่งรอหน้า Clubhouse นานเกินจำเป็น</p>
  `;
}

function updatePin(progress) {
  const left = 14 + progress * 0.58;
  const bottom = 22 + progress * 0.36;
  elements.guestPin.style.left = `${left}%`;
  elements.guestPin.style.bottom = `${bottom}%`;
  elements.routeProgress.style.width = `${Math.max(5, progress * 0.66)}%`;
  const booking = getSelectedTrackingBooking();
  elements.mapEtaLabel.textContent = booking ? `${booking.eta} นาที` : "- นาที";
}

function getSelectedTrackingBooking() {
  const selectedId = Number(elements.trackingBooking.value);
  const visibleBookings = getTrackingVisibleBookings();
  return visibleBookings.find(booking => booking.id === selectedId) || visibleBookings[0];
}

function getBooking(id) {
  return state.bookings.find(booking => booking.id === id);
}

function getCaddy(id) {
  return state.caddies.find(caddy => caddy.id === id);
}

function getTrackingCaddy() {
  return trackingCaddyId ? getCaddy(trackingCaddyId) : null;
}

function getTrackingVisibleBookings() {
  const caddy = getTrackingCaddy();
  if (!caddy) return [];
  return state.bookings.filter(booking => getBookingCaddyIds(booking).includes(caddy.id));
}

function getBookingCaddyIds(booking) {
  return Array.isArray(booking.caddyIds) ? booking.caddyIds : [booking.caddyId].filter(Boolean);
}

function getBookingCaddies(booking) {
  return getBookingCaddyIds(booking)
    .map(id => getCaddy(id))
    .filter(Boolean);
}

function renderCaddyTrackingWorkflow(booking, caddy) {
  if (!caddy) return "";
  const acknowledged = Boolean(booking.caddyAcknowledgements && booking.caddyAcknowledgements[caddy.id]);
  const metGuest = Boolean(booking.caddyMetGuests && booking.caddyMetGuests[caddy.id]);
  const canAcknowledge = shouldAlertCaddy(booking) && !acknowledged;
  const canMeetGuest = !metGuest && (acknowledged || shouldAlertCaddy(booking) || booking.status === "arrived" || booking.progress >= 90);

  return `
    <div class="caddy-workflow">
      <div>
        <strong>สถานะแคดดี้ของฉัน</strong>
        <span>${caddy.number} ${caddy.name} • ${metGuest ? "เจอนายแล้ว" : acknowledged ? "รับทราบแล้ว กำลังเตรียมไปรอ" : "รอแจ้งเตือนเมื่อผู้จองใกล้ถึง"}</span>
      </div>
      ${metGuest ? `<div class="met-alert"><strong>ยืนยันแล้ว</strong><span>${caddy.number} ${caddy.name} เจอผู้จองแล้ว</span></div>` : ""}
      <div class="booking-actions">
        <button class="secondary-button" data-tracking-caddy-action="acknowledge" type="button" ${canAcknowledge ? "" : "disabled"}>รับทราบ</button>
        <button class="primary-button" data-tracking-caddy-action="met" type="button" ${canMeetGuest ? "" : "disabled"}>เจอนายแล้ว</button>
      </div>
    </div>
  `;
}

function renderCaddyMetNotice(booking) {
  const metIds = booking.caddyMetGuests ? Object.keys(booking.caddyMetGuests).filter(id => booking.caddyMetGuests[id]) : [];
  if (!metIds.length) return "";

  const metCaddies = metIds
    .map(id => getCaddy(Number(id)))
    .filter(Boolean);
  if (!metCaddies.length) return "";

  const allMet = areAllAssignedCaddiesMet(booking);
  return `
    <div class="met-alert">
      <strong>${allMet ? "แคดดี้เจอผู้จองครบแล้ว" : "แคดดี้ยืนยันเจอผู้จองแล้ว"}</strong>
      <span>${formatCaddyLabels(metCaddies)} กด “เจอนายแล้ว” สำหรับรายการของ ${booking.guestName}</span>
    </div>
  `;
}

function getAssignmentToast(booking, caddies) {
  const caddyLabel = formatCaddyLabels(caddies);
  if (booking.assignedBy === "ระบบจัดคิว") {
    return `ระบบเลือกแคดดี้ให้แล้ว: ${caddyLabel}`;
  }
  return `จองสำเร็จ: จัดแคดดี้ให้แล้ว ${caddyLabel}`;
}

function getAssignmentText(booking, caddies) {
  const caddyLabel = caddies.length ? formatCaddyLabels(caddies) : "ไม่พบข้อมูลแคดดี้";
  if (booking.assignedBy === "ระบบจัดคิว") {
    return `ระบบจัดคิวเลือก ${caddyLabel} ให้ผู้จองสำหรับเวลา ${booking.teeTime} น.`;
  }
  if (booking.assignedBy === "เลือกเอง + ระบบจัดคิว") {
    return `ผู้จองเลือกแคดดี้หลัก และระบบจัดคิวเพิ่มเป็น ${caddyLabel} สำหรับเวลา ${booking.teeTime} น.`;
  }
  return `ผู้จองเลือก ${caddyLabel} สำหรับเวลา ${booking.teeTime} น.`;
}

function calculateBookingCosts(players, golfCarts, caddyCount) {
  const greenFee = state.pricing.greenFee * players;
  const cartFee = state.pricing.cartFee * golfCarts;
  const caddyFee = state.pricing.caddyFee * caddyCount;
  return {
    greenFee,
    cartFee,
    caddyFee,
    total: greenFee + cartFee + caddyFee,
    pricing: { ...state.pricing }
  };
}

function getBookingCosts(booking) {
  if (booking.costs) return booking.costs;
  return calculateBookingCosts(Number(booking.players || 1), Number(booking.golfCarts || 0), getBookingCaddyIds(booking).length || Number(booking.players || 1));
}

function renderCostSummary(booking) {
  const costs = getBookingCosts(booking);
  const pricing = costs.pricing || state.pricing;
  return `
    <div class="cost-summary">
      <div class="price-row"><span>กรีนฟี ${formatCurrency(pricing.greenFee)} x ${booking.players}</span><b>${formatCurrency(costs.greenFee)}</b></div>
      <div class="price-row"><span>รถกอล์ฟ ${formatCurrency(pricing.cartFee)} x ${booking.golfCarts || 0}</span><b>${formatCurrency(costs.cartFee)}</b></div>
      <div class="price-row"><span>แคดดี้ ${formatCurrency(pricing.caddyFee)} x ${getBookingCaddyIds(booking).length}</span><b>${formatCurrency(costs.caddyFee)}</b></div>
      <div class="price-row total"><span>ยอดรวม</span><b>${formatCurrency(costs.total)}</b></div>
    </div>
  `;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function shouldAlertCaddy(booking) {
  return booking.status === "traveling" && booking.eta <= 30 && booking.progress < 100;
}

function areAllAssignedCaddiesMet(booking) {
  const assignedIds = getBookingCaddyIds(booking);
  if (!assignedIds.length) return false;
  return assignedIds.every(id => booking.caddyMetGuests && booking.caddyMetGuests[id]);
}

function checkCaddyArrivalAlert(booking, notify) {
  if (!shouldAlertCaddy(booking) || booking.caddyAlerted) return;
  booking.caddyAlerted = true;
  if (!notify) return;

  const caddies = getBookingCaddies(booking);
  showToast(`แจ้ง ${caddies.length ? formatCaddyLabels(caddies) : "แคดดี้"}: ${booking.guestName} จะถึงสนามในประมาณ ${booking.eta} นาที`);
}

function getAlertBookingsForCaddy(caddyId) {
  return state.bookings
    .filter(booking => getBookingCaddyIds(booking).includes(caddyId) && shouldAlertCaddy(booking))
    .sort((a, b) => a.eta - b.eta);
}

function getAssignedByText(preferredId, playerCount) {
  if (!preferredId) return "ระบบจัดคิว";
  return playerCount > 1 ? "เลือกเอง + ระบบจัดคิว" : "เลือกเอง";
}

function formatCaddyLabels(caddies) {
  return caddies.map(caddy => `${caddy.number} ${caddy.name}`).join(", ");
}

function formatCaddyNames(caddies) {
  return caddies.map(caddy => caddy.name).join(", ");
}

function formatCaddyNumbers(caddies) {
  return caddies.map(caddy => caddy.number).join(", ");
}

function getReadyCaddiesInQueue() {
  return state.caddies
    .filter(caddy => caddy.confirmed)
    .sort((a, b) => a.queue - b.queue);
}

function getQueueRank(caddyId) {
  return getReadyCaddiesInQueue().findIndex(caddy => caddy.id === caddyId) + 1;
}

function normalizeCaddyNumber(value) {
  const cleanValue = value.trim().toUpperCase().replace(/\s+/g, "");
  if (cleanValue.startsWith("C-")) return cleanValue;
  if (cleanValue.startsWith("C")) return `C-${cleanValue.slice(1).padStart(3, "0")}`;
  return `C-${cleanValue.padStart(3, "0")}`;
}

function getNextQueue(excludeId) {
  return Math.max(0, ...state.caddies
    .filter(caddy => caddy.id !== excludeId)
    .map(caddy => caddy.queue || 0)) + 1;
}

function normalizeCaddyQueue() {
  state.caddies
    .slice()
    .sort((a, b) => a.queue - b.queue)
    .forEach((caddy, index) => {
      caddy.queue = index + 1;
    });
}

function statusText(status) {
  const text = {
    confirmed: "ยืนยันจอง",
    traveling: "กำลังเดินทาง",
    arrived: "ถึงสนามแล้ว",
    met: "เจอนายแล้ว"
  };
  return text[status] || status;
}

function formatThaiDate(value) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveAuthState() {
  sessionStorage.setItem("golf-booking-auth", JSON.stringify(authState));
}

function saveTrackingCaddyId() {
  if (trackingCaddyId) {
    sessionStorage.setItem("golf-booking-tracking-caddy", String(trackingCaddyId));
  } else {
    sessionStorage.removeItem("golf-booking-tracking-caddy");
  }
}

function loadTrackingCaddyId() {
  const saved = Number(sessionStorage.getItem("golf-booking-tracking-caddy"));
  return Number.isFinite(saved) && saved > 0 ? saved : null;
}

function loadAuthState() {
  const saved = sessionStorage.getItem("golf-booking-auth");
  if (!saved) return { caddy: false, admin: false, manager: false };
  try {
    return { caddy: false, admin: false, manager: false, ...JSON.parse(saved) };
  } catch {
    return { caddy: false, admin: false, manager: false };
  }
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);
  try {
    return migrateState(JSON.parse(saved));
  } catch {
    return structuredClone(seedState);
  }
}

function resetDemo() {
  stopTrackingDemo(false);
  state = structuredClone(seedState);
  normalizeCaddyQueue();
  saveState();
  renderAll();
  showToast("โหลดข้อมูลตัวอย่างแล้ว");
}

function resetBookings() {
  stopTrackingDemo(false);
  latestAssignment = null;
  state.bookings = [];
  state.nextBookingId = 1;
  state.caddies.forEach(caddy => {
    caddy.jobs = 0;
  });
  normalizeCaddyQueue();
  saveState();
  renderAll();
  showToast("รีเซ็ตข้อมูลผู้จองแล้ว");
}

function resetCaddies() {
  stopTrackingDemo(false);
  latestAssignment = null;
  state.caddies = [];
  state.bookings = [];
  state.nextCaddyId = 1;
  state.nextBookingId = 1;
  saveState();
  renderAll();
  showToast("รีเซ็ตข้อมูลแคดดี้และรายการจองที่เกี่ยวข้องแล้ว");
}

function resetAllData() {
  stopTrackingDemo(false);
  latestAssignment = null;
  state = {
    nextBookingId: 1,
    nextCaddyId: 1,
    pricing: { ...state.pricing },
    caddies: [],
    bookings: []
  };
  saveState();
  renderAll();
  showToast("รีเซ็ตข้อมูลผู้จองและแคดดี้ทั้งหมดแล้ว");
}

function migrateState(savedState) {
  const nextCaddyId = Math.max(0, ...savedState.caddies.map(caddy => caddy.id || 0)) + 1;
  const pricing = savedState.pricing || { greenFee: 1800, cartFee: 700, caddyFee: 500 };
  return {
    ...savedState,
    pricing,
    nextCaddyId: savedState.nextCaddyId || nextCaddyId,
    caddies: savedState.caddies.map(caddy => ({
      phone: "",
      ...caddy,
      queue: caddy.queue || getNextQueueFrom(savedState.caddies)
    })),
    bookings: savedState.bookings.map(booking => ({
      ...booking,
      golfCarts: Number.isFinite(Number(booking.golfCarts)) ? Number(booking.golfCarts) : Math.ceil(Number(booking.players || 1) / 2),
      caddyAlerted: shouldAlertCaddy(booking),
      caddyIds: Array.isArray(booking.caddyIds) ? booking.caddyIds : [booking.caddyId].filter(Boolean),
      caddyAcknowledgements: booking.caddyAcknowledgements || {},
      caddyMetGuests: booking.caddyMetGuests || {},
      costs: booking.costs || calculateMigratedCosts(booking, pricing)
    }))
  };
}

function calculateMigratedCosts(booking, pricing) {
  const players = Number(booking.players || 1);
  const golfCarts = Number.isFinite(Number(booking.golfCarts)) ? Number(booking.golfCarts) : Math.ceil(players / 2);
  const caddyCount = Array.isArray(booking.caddyIds) ? booking.caddyIds.length : [booking.caddyId].filter(Boolean).length || players;
  const greenFee = pricing.greenFee * players;
  const cartFee = pricing.cartFee * golfCarts;
  const caddyFee = pricing.caddyFee * caddyCount;
  return { greenFee, cartFee, caddyFee, total: greenFee + cartFee + caddyFee, pricing: { ...pricing } };
}

function getNextQueueFrom(caddies) {
  return Math.max(0, ...caddies.map(caddy => caddy.queue || 0)) + 1;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2800);
}
