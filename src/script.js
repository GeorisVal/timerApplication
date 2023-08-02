let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const monthsInEnglish = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function changeLanguage(lang) {
  var elements = document.querySelectorAll("[data-translate]");

  if (lang === "en") {
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      element.textContent = key;
    });
  } else {
    elements.forEach(function (element) {
      var key = element.getAttribute("data-translate");
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });
  }
}

function generateCalendar(month, year) {
  loadCalendarData();
  const monthNameElement = document.getElementById("monthName");
  monthNameElement.textContent = monthsInEnglish[month];
  const calendarContainer = document.getElementById("calendarContainer");
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  let startDay = firstDayOfMonth.getDay();

  if (startDay === 0) {
    startDay = 6;
  } else {
    startDay -= 1;
  }

  let calendarHTML = "<table class='border-collapse w-full'>";
  calendarHTML += "<thead><tr>";
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (const day of daysOfWeek) {
    calendarHTML += `<th class="border border-gray-400 py-2 text-center">${day}</th>`;
  }
  calendarHTML += "</tr></thead><tbody><tr>";

  let dayCount = 1;
  for (let i = 0; i < startDay; i++) {
    calendarHTML += "<td class='border border-gray-400 py-2 text-center'></td>";
  }
  for (let i = startDay; i < 7; i++) {
    calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
    dayCount++;
  }
  calendarHTML += "</tr>";

  while (dayCount <= daysInMonth) {
    calendarHTML += "<tr>";
    for (let i = 0; i < 7 && dayCount <= daysInMonth; i++) {
      calendarHTML += `<td class='border border-gray-400 py-2 text-center' data-day="${dayCount}">${dayCount}</td>`;
      dayCount++;
    }
    calendarHTML += "</tr>";
  }

  calendarHTML += "</tbody></table>";

  calendarContainer.innerHTML = calendarHTML;

  const tdElements = calendarContainer.querySelectorAll("td");
  tdElements.forEach((td) => {
    td.addEventListener("click", handleTdClick);
  });

  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = getFormattedDateKey(year, month + 1, i);
    const durationMinutes = localStorage.getItem(dateKey);
    if (durationMinutes) {
      const td = calendarContainer.querySelector(`td[data-day="${i}"]`);
      if (td) {
        const newDurationSpan = document.createElement("span");
        newDurationSpan.textContent = " - " + durationMinutes + "min";
        td.innerHTML = i + newDurationSpan.outerHTML;
      }
    }
  }

  updateLocalStorage(month, year);
}

function updateLocalStorage() {
  const calendarContainer = document.getElementById("calendarContainer");
  const tdElements = calendarContainer.querySelectorAll("td");

  const calendarData = {};

  tdElements.forEach((td) => {
    const day = td.getAttribute("data-day");
    const dateKey = getFormattedDateKey(currentYear, currentMonth + 1, day);
    const durationSpan = td.querySelector("span");

    if (durationSpan) {
      const durationMinutes = parseInt(
        durationSpan.textContent.trim().split(" ")[2]
      );
      calendarData[dateKey] = durationMinutes;
    } else {
      delete calendarData[dateKey];
    }
  });

  localStorage.setItem("calendarData", JSON.stringify(calendarData));
}

function navigateMonth(direction) {
  currentMonth += direction;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentMonth, currentYear);
}

document.addEventListener("DOMContentLoaded", () => {
  generateCalendar(currentMonth, currentYear);
});

var timerInterval;
var startTime;
var elapsedTime = 0;
var isPaused = false;
var hourlyRate = 10;

function startTimer() {
  if (!timerInterval) {
    if (elapsedTime === 0) {
      startTime = Date.now();
    } else {
      startTime = Date.now() - elapsedTime;
    }
    timerInterval = setInterval(updateTimer, 10);
  }
}

function updateTimer() {
  if (!isPaused) {
    var currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    var formattedTime = formatTime(elapsedTime);
    document.getElementById("timer").textContent = formattedTime;
    document.getElementById("elapsed-time-value").textContent = formattedTime;
    calculatePaymentAmount();
    saveElapsedTimeToStorage();
  }
}

function togglePause() {
  isPaused = !isPaused;
  var pauseButton = document.getElementById("pause");
  pauseButton.textContent = isPaused ? "Continue" : "Pause";

  if (isPaused) {
    clearInterval(timerInterval);
    timerInterval = null;
    saveElapsedTimeToStorage();
  } else {
    startTimer();
  }
}

function resetTimer() {
  var confirmReset = confirm("Are you sure you want to start over?");

  if (confirmReset) {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = 0;
    document.getElementById("timer").textContent = "00:00:00";
    document.getElementById("elapsed-time-value").textContent = "00:00:00";
    document.getElementById("payment-amount-value").textContent = "0 €";
    isPaused = false;
    document.getElementById("pause").textContent = "Pause";
    saveElapsedTimeToStorage();
  }
}

function formatTime(time) {
  var milliseconds = Math.floor((time % 1000) / 10);
  var seconds = Math.floor((time / 1000) % 60);
  var minutes = Math.floor((time / 1000 / 60) % 60);
  var hours = Math.floor(time / 1000 / 60 / 60);
  return (
    pad(hours, 2) +
    ":" +
    pad(minutes, 2) +
    ":" +
    pad(seconds, 2) +
    "." +
    pad(milliseconds, 2)
  );
}

function handleTdClick(event) {
  const tdContent = event.target.textContent.trim();
  const durationSpan = event.target.querySelector("span");
  const dateKey = getFormattedDateKey(
    currentYear,
    currentMonth + 1,
    event.target.getAttribute("data-day")
  );

  if (tdContent === "" || durationSpan) {
    const editOrDelete = prompt(
      "Choose an option : 'E' to edit, 'D' to delete."
    );

    if (editOrDelete !== null) {
      const option = editOrDelete.trim().toUpperCase();
      if (option === "E") {
        if (!durationSpan) {
          const newDurationSpan = document.createElement("span");
          event.target.appendChild(newDurationSpan);
          durationSpan = newDurationSpan;
        }
        const inputString = prompt("Enter your work time (ex. : 2h 30m) :");
        if (inputString !== null) {
          const [heures, minutes] = inputString
            .split("h")
            .map((str) => parseInt(str.trim()));
          const minutesTotal = heures * 60 + (minutes || 0);
          durationSpan.textContent = " - " + minutesTotal + "min";
          localStorage.setItem(dateKey, minutesTotal);
        }
      } else if (option === "D") {
        if (durationSpan) {
          durationSpan.remove();
          localStorage.removeItem(dateKey);
        }
      } else {
        alert("Unvalid option. Please try again.");
      }
    }
  } else {
    const inputString = prompt("Enter your worktime (ex. : 2h 30m) :");

    if (inputString !== null) {
      const [heures, minutes] = inputString
        .split("h")
        .map((str) => parseInt(str.trim()));
      const minutesTotal = heures * 60 + (minutes || 0);
      const newDurationSpan = document.createElement("span");
      newDurationSpan.textContent = " - " + minutesTotal + "min";
      event.target.innerHTML += newDurationSpan.outerHTML;
      localStorage.setItem(dateKey, minutesTotal);
    }
  }
}

function getFormattedDateKey(year, month, day) {
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function loadCalendarData() {
  const storedCalendarData = localStorage.getItem("calendarData");

  if (storedCalendarData) {
    const calendarData = JSON.parse(storedCalendarData);

    for (const dateKey in calendarData) {
      const [year, month, day] = dateKey.split("-").map(Number);
      const durationMinutes = calendarData[dateKey];
      const td = document.querySelector(`td[data-day="${day}"]`);
      if (td) {
        const newDurationSpan = document.createElement("span");
        newDurationSpan.textContent = " - " + durationMinutes + "min";
        td.innerHTML = day + newDurationSpan.outerHTML;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCalendarData();
});

window.addEventListener("beforeunload", () => {
  localStorage.setItem("currentMonth", currentMonth);
  localStorage.setItem("currentYear", currentYear);
});

function pad(value, length) {
  return value.toString().padStart(length, "0");
}

function saveElapsedTimeToStorage() {
  localStorage.setItem("elapsedTime", elapsedTime);
}

function loadElapsedTimeFromStorage() {
  var storedElapsedTime = localStorage.getItem("elapsedTime");
  if (storedElapsedTime) {
    elapsedTime = parseInt(storedElapsedTime);
    document.getElementById("timer").textContent = formatTime(elapsedTime);
    document.getElementById("elapsed-time-value").textContent =
      formatTime(elapsedTime);
    calculatePaymentAmount();
  }
}

function calculatePaymentAmount() {
  var paymentAmount = (elapsedTime / 1000 / 60 / 60) * hourlyRate;
  document.getElementById("payment-amount-value").textContent =
    paymentAmount.toFixed(2) + " €";
}

function updateHourlyRate() {
  hourlyRate = parseFloat(document.getElementById("hourly-rate-input").value);
  calculatePaymentAmount();
}

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", togglePause);
document.getElementById("reset").addEventListener("click", resetTimer);
document
  .getElementById("hourly-rate-input")
  .addEventListener("input", updateHourlyRate);

loadElapsedTimeFromStorage();