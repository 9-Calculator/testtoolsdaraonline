(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const buttons = [...document.querySelectorAll(".unit-button")];
  const metricFields = $("#metricFields");
  const imperialFields = $("#imperialFields");
  const formError = $("#formError");
  const resultPanel = $("#resultPanel");
  const themeToggle = $("#themeToggle");
  const menuToggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");

  let unit = "metric";

  // Dynamic current year set
  const yearSpan = $("#year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Dark Mode Toggle
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.textContent = "☼";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.textContent = "☽";
    }
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    mobileNav.hidden = isExpanded;
  });

  // Unit Switcher
  buttons.forEach(btn => btn.addEventListener("click", () => {
    unit = btn.dataset.unit;
    buttons.forEach(b => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    metricFields.hidden = unit !== "metric";
    imperialFields.hidden = unit !== "imperial";

    // Clear messages and results when switching units
    formError.hidden = true;
    formError.textContent = "";
    resultPanel.hidden = true;
  }));

  // Form Submit Handler
  $("#bmiForm").addEventListener("submit", event => {
    event.preventDefault();
    formError.hidden = true;
    formError.textContent = "";

    let bmi;

    if (unit === "metric") {
      const height = parseFloat($("#heightCm").value) / 100;
      const weight = parseFloat($("#weightKg").value);

      if (isNaN(height) || height <= 0 || isNaN(weight) || weight <= 0) {
        formError.textContent = "Please enter valid height and weight measurements.";
        formError.hidden = false;
        resultPanel.hidden = true;
        return;
      }
      bmi = weight / (height * height);
    } else {
      const feet = parseFloat($("#heightFt").value) || 0;
      const inches = parseFloat($("#heightIn").value) || 0;
      const weight = parseFloat($("#weightLb").value);

      const totalInches = (feet * 12) + inches;

      if (totalInches <= 0 || isNaN(weight) || weight <= 0) {
        formError.textContent = "Please enter valid height and weight measurements.";
        formError.hidden = false;
        resultPanel.hidden = true;
        return;
      }
      bmi = (weight / (totalInches * totalInches)) * 703;
    }

    bmi = Math.round(bmi * 10) / 10;
    let category, advice;

    if (bmi < 18.5) {
      category = "Underweight";
      advice = "BMI is below the commonly used adult healthy range.";
    } else if (bmi < 25) {
      category = "Healthy range";
      advice = "BMI falls within the commonly used adult healthy range.";
    } else if (bmi < 30) {
      category = "Overweight";
      advice = "BMI falls within the commonly used adult overweight range.";
    } else {
      category = "Obesity";
      advice = "BMI is in the commonly used adult obesity range.";
    }

    $("#bmiValue").textContent = bmi.toFixed(1);
    $("#bmiCategory").textContent = category;
    $("#bmiMessage").textContent = advice;
    resultPanel.hidden = false;
  });

  // Reset Button Handler
  $("#bmiForm").addEventListener("reset", () => {
    formError.hidden = true;
    formError.textContent = "";
    resultPanel.hidden = true;
  });
})();
