const navCollapse = document.getElementById("mainNav");

document.querySelectorAll(".navbar .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (navCollapse && navCollapse.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
    }
  });
});

const bookingModalElement = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const selectedService = document.getElementById("selectedService");
const preferredDate = document.getElementById("preferredDate");
const successToastElement = document.getElementById("successToast");
// const API_BASE_URL = "http://localhost:9000/api";
const API_BASE_URL = "https://topmate-uat-backend.vercel.app/api/bookings";

if (preferredDate) {
  preferredDate.min = new Date().toISOString().split("T")[0];
}

if (bookingModalElement && selectedService) {
  const bookingModal = new bootstrap.Modal(bookingModalElement);

  document.querySelectorAll(".book-btn").forEach((button) => {
    button.addEventListener("click", () => {
      selectedService.value = button.dataset.service || "";
      bookingModal.show();
    });
  });

  if (bookingForm && successToastElement) {
    const successToast = new bootstrap.Toast(successToastElement, { delay: 3500 });

    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!bookingForm.checkValidity()) {
        bookingForm.classList.add("was-validated");
        return;
      }

      const submitButton = bookingForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        const bookingDetails = {
          candidateName: document.getElementById("candidateName").value.trim(),
          emailAddress: document.getElementById("emailAddress").value.trim(),
          mobileNumber: document.getElementById("mobileNumber").value.trim(),
          selectedService: selectedService.value,
          preferredDate: document.getElementById("preferredDate").value,
          preferredTime: document.getElementById("preferredTime").value,
        };

        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingDetails),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Booking failed");
        }

        successToast.show();
        bookingForm.reset();
        bookingForm.classList.remove("was-validated");
        bookingModal.hide();
      } catch (error) {
        alert(error.message || "Unable to submit booking. Please try again.");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  bookingModalElement.addEventListener("hidden.bs.modal", () => {
    if (bookingForm) {
      bookingForm.classList.remove("was-validated");
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});
