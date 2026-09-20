(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const tabs = [...document.querySelectorAll(".unit-tab")];
  const metricFields = $("#metricFields");
  const imperialFields = $("#imperialFields");
  let unit = "metric";

  tabs.forEach(tab => tab.addEventListener("click", () => {
    unit = tab.dataset.unit;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    metricFields.hidden = unit !== "metric";
    imperialFields.hidden = unit !== "imperial";
    $("#heightCm").required = unit === "metric";
    $("#weightKg").required = unit === "metric";
    $("#heightIn").required = unit === "imperial";
    $("#weightLb").required = unit === "imperial";
    $("#bmiResult").hidden = true;
  }));

  $("#bmiForm").addEventListener("submit", event => {
    event.preventDefault();
    let bmi;
    if (unit === "metric") {
      const height = parseFloat($("#heightCm").value) / 100;
      const weight = parseFloat($("#weightKg").value);
      if (!(height > 0) || !(weight > 0)) return;
      bmi = weight / (height * height);
    } else {
      const height = parseFloat($("#heightIn").value);
      const weight = parseFloat($("#weightLb").value);
      if (!(height > 0) || !(weight > 0)) return;
      bmi = (weight / (height * height)) * 703;
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
    $("#bmiAdvice").textContent = advice;
    $("#bmiResult").hidden = false;
  });
})();
