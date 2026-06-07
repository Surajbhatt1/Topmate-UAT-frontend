const API_BASE_URL = "http://localhost:9000/api";

const bookingsTableBody = document.getElementById("bookingsTableBody");
const bookingFilters = document.getElementById("bookingFilters");
const filterDate = document.getElementById("filterDate");
const filterService = document.getElementById("filterService");
const clearFilters = document.getElementById("clearFilters");
const refreshBookings = document.getElementById("refreshBookings");
const tableStatus = document.getElementById("tableStatus");

const totalBookings = document.getElementById("totalBookings");
const todayBookings = document.getElementById("todayBookings");
const filteredBookings = document.getElementById("filteredBookings");
const emailPending = document.getElementById("emailPending");

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderServices(services) {
  if (!filterService || filterService.dataset.loaded === "true") {
    return;
  }

  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    filterService.appendChild(option);
  });

  filterService.dataset.loaded = "true";
}

function renderStats(stats) {
  totalBookings.textContent = stats.totalBookings || 0;
  todayBookings.textContent = stats.todayBookings || 0;
  filteredBookings.textContent = stats.filteredBookings || 0;
  emailPending.textContent = stats.emailPending || 0;
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No bookings found.</td></tr>';
    return;
  }

  bookingsTableBody.innerHTML = bookings.map((booking) => `
    <tr>
      <td class="fw-semibold">${escapeHtml(booking.candidateName)}</td>
      <td><a href="mailto:${escapeHtml(booking.emailAddress)}">${escapeHtml(booking.emailAddress)}</a></td>
      <td><a href="tel:${escapeHtml(booking.mobileNumber)}">${escapeHtml(booking.mobileNumber)}</a></td>
      <td>${escapeHtml(booking.selectedService)}</td>
      <td>${escapeHtml(booking.preferredDate)}</td>
      <td>${escapeHtml(booking.preferredTime)}</td>
      <td><span class="badge ${booking.emailSent ? "text-bg-success" : "text-bg-warning"}">${booking.emailSent ? "Sent" : "Pending"}</span></td>
      <td>${formatDateTime(booking.createdAt)}</td>
    </tr>
  `).join("");
}

async function loadBookings() {
  const params = new URLSearchParams();

  if (filterDate.value) {
    params.set("date", filterDate.value);
  }

  if (filterService.value) {
    params.set("service", filterService.value);
  }

  tableStatus.textContent = "Loading bookings...";

  try {
    const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load bookings");
    }

    renderServices(data.services || []);
    renderStats(data.stats || {});
    renderBookings(data.bookings || []);
    tableStatus.textContent = `${(data.bookings || []).length} booking(s) shown`;
  } catch (error) {
    bookingsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">${error.message}</td></tr>`;
    tableStatus.textContent = "Failed to load";
  }
}

bookingFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  loadBookings();
});

clearFilters.addEventListener("click", () => {
  filterDate.value = "";
  filterService.value = "";
  loadBookings();
});

refreshBookings.addEventListener("click", loadBookings);

loadBookings();
