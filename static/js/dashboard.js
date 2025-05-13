import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Population by Year Chart
  const populationChartCtx = document.getElementById("populationChart").getContext("2d")
  const populationData = JSON.parse(document.getElementById("populationChart").getAttribute("data-population"))

  new Chart(populationChartCtx, {
    type: "line",
    data: {
      labels: populationData.map((item) => item.year),
      datasets: [
        {
          label: "Population",
          data: populationData.map((item) => item.total),
          backgroundColor: "rgba(0, 184, 148, 0.2)",
          borderColor: "rgba(0, 184, 148, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  })

  // Species Distribution Chart
  const speciesChartCtx = document.getElementById("speciesChart").getContext("2d")
  const speciesData = JSON.parse(document.getElementById("speciesChart").getAttribute("data-species"))

  new Chart(speciesChartCtx, {
    type: "doughnut",
    data: {
      labels: speciesData.map((item) => item.genus__family__name),
      datasets: [
        {
          data: speciesData.map((item) => item.count),
          backgroundColor: [
            "rgba(0, 184, 148, 0.7)",
            "rgba(0, 206, 201, 0.7)",
            "rgba(9, 132, 227, 0.7)",
            "rgba(108, 92, 231, 0.7)",
            "rgba(253, 121, 168, 0.7)",
            "rgba(225, 112, 85, 0.7)",
            "rgba(46, 204, 113, 0.7)",
            "rgba(52, 152, 219, 0.7)",
            "rgba(155, 89, 182, 0.7)",
            "rgba(241, 196, 15, 0.7)",
          ],
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  })

  // Health Status Chart
  const healthChartCtx = document.getElementById("healthChart").getContext("2d")

  // Assuming healthData is passed from the template
  const healthData = JSON.parse(document.getElementById("healthChart").getAttribute("data-health"))

  // Map health status codes to readable labels
  const healthLabels = {
    very_poor: "Very Poor",
    poor: "Poor",
    good: "Good",
    very_good: "Very Good",
    excellent: "Excellent",
  }

  // Map health status to colors
  const healthColors = {
    very_poor: "rgba(231, 76, 60, 0.7)",
    poor: "rgba(241, 196, 15, 0.7)",
    good: "rgba(46, 204, 113, 0.7)",
    very_good: "rgba(52, 152, 219, 0.7)",
    excellent: "rgba(155, 89, 182, 0.7)",
  }

  // Process health data
  const healthLabelsArray = healthData.map((item) => healthLabels[item.health_status] || item.health_status)
  const healthCountsArray = healthData.map((item) => item.count)
  const healthColorsArray = healthData.map((item) => healthColors[item.health_status] || "rgba(0, 0, 0, 0.7)")

  new Chart(healthChartCtx, {
    type: "pie",
    data: {
      labels: healthLabelsArray,
      datasets: [
        {
          data: healthCountsArray,
          backgroundColor: healthColorsArray,
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  })
})
