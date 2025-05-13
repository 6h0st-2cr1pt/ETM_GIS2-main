import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Mock data for healthStatusData and healthByYearData
  const healthStatusData = [
    { health_status: "very_poor", count: 10 },
    { health_status: "poor", count: 20 },
    { health_status: "good", count: 30 },
    { health_status: "very_good", count: 25 },
    { health_status: "excellent", count: 15 },
  ]

  const healthByYearData = [
    { year: 2020, health_status: "very_poor", count: 2 },
    { year: 2020, health_status: "poor", count: 4 },
    { year: 2020, health_status: "good", count: 6 },
    { year: 2021, health_status: "very_poor", count: 3 },
    { year: 2021, health_status: "poor", count: 5 },
    { year: 2021, health_status: "good", count: 7 },
  ]

  // Population Time Chart
  const populationTimeChartCtx = document.getElementById("populationTimeChart").getContext("2d")
  const populationData = JSON.parse(document.getElementById("populationTimeChart").getAttribute("data-population"))

  new Chart(populationTimeChartCtx, {
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

  // Species Count Chart
  const speciesCountChartCtx = document.getElementById("speciesCountChart").getContext("2d")
  const speciesData = JSON.parse(document.getElementById("speciesCountChart").getAttribute("data-species"))

  new Chart(speciesCountChartCtx, {
    type: "bar",
    data: {
      labels: speciesData.map((item) => item.species),
      datasets: [
        {
          label: "Count",
          data: speciesData.map((item) => item.count),
          backgroundColor: "rgba(9, 132, 227, 0.7)",
          borderColor: "rgba(9, 132, 227, 1)",
          borderWidth: 1,
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

  // Family Distribution Chart
  const familyDistributionChartCtx = document.getElementById("familyDistributionChart").getContext("2d")
  const familyData = JSON.parse(document.getElementById("familyDistributionChart").getAttribute("data-family"))

  new Chart(familyDistributionChartCtx, {
    type: "doughnut",
    data: {
      labels: familyData.map((item) => item.name),
      datasets: [
        {
          data: familyData.map((item) => item.total),
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

  // Health Status Distribution Chart
  const healthDistributionChartCtx = document.getElementById("healthDistributionChart").getContext("2d")

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
  const healthLabelsArray = healthStatusData.map((item) => healthLabels[item.health_status] || item.health_status)
  const healthCountsArray = healthStatusData.map((item) => item.count)
  const healthColorsArray = healthStatusData.map((item) => healthColors[item.health_status] || "rgba(0, 0, 0, 0.7)")

  new Chart(healthDistributionChartCtx, {
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

  // Health Status by Year Chart
  const healthByYearChartCtx = document.getElementById("healthByYearChart").getContext("2d")

  // Process health by year data
  const years = [...new Set(healthByYearData.map((item) => item.year))].sort()
  const healthStatuses = [...new Set(healthByYearData.map((item) => item.health_status))]

  const healthByYearDatasets = healthStatuses.map((status) => {
    const statusData = years.map((year) => {
      const match = healthByYearData.find((item) => item.year === year && item.health_status === status)
      return match ? match.count : 0
    })

    return {
      label: healthLabels[status] || status,
      data: statusData,
      backgroundColor: healthColors[status] || "rgba(0, 0, 0, 0.7)",
      borderColor: healthColors[status] || "rgba(0, 0, 0, 0.7)",
      borderWidth: 1,
    }
  })

  new Chart(healthByYearChartCtx, {
    type: "bar",
    data: {
      labels: years,
      datasets: healthByYearDatasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          stacked: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  })

  // Conservation Status Chart
  const conservationStatusChartCtx = document.getElementById("conservationStatusChart").getContext("2d")
  const conservationData = JSON.parse(
    document.getElementById("conservationStatusChart").getAttribute("data-conservation"),
  )

  new Chart(conservationStatusChartCtx, {
    type: "bar",
    data: {
      labels: conservationData.map((item) => item.status),
      datasets: [
        {
          label: "Count",
          data: conservationData.map((item) => item.count),
          backgroundColor: [
            "rgba(46, 204, 113, 0.7)",
            "rgba(241, 196, 15, 0.7)",
            "rgba(230, 126, 34, 0.7)",
            "rgba(231, 76, 60, 0.7)",
            "rgba(192, 57, 43, 0.7)",
          ],
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
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
          display: false,
        },
      },
    },
  })

  // Growth Rate Chart
  const growthRateChartCtx = document.getElementById("growthRateChart").getContext("2d")
  const growthRateData = JSON.parse(document.getElementById("growthRateChart").getAttribute("data-growth"))

  new Chart(growthRateChartCtx, {
    type: "line",
    data: {
      labels: growthRateData.map((item) => item.year),
      datasets: [
        {
          label: "Growth Rate (%)",
          data: growthRateData.map((item) => item.growth_rate),
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          borderColor: "rgba(52, 152, 219, 1)",
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

  // Initialize mini map
  const distributionMap = L.map("distributionMap").setView([10.4234, 123.1234], 7)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(distributionMap)

  // Fetch tree data for map
  fetch("/api/tree-data/")
    .then((response) => response.json())
    .then((data) => {
      // Create a GeoJSON layer
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 5,
            fillColor: getHealthColor(feature.properties.health_status),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
                        <strong>${feature.properties.common_name}</strong><br>
                        <em>${feature.properties.scientific_name}</em><br>
                        Population: ${feature.properties.population}<br>
                        Health: ${getHealthLabel(feature.properties.health_status)}
                    `)
        },
      }).addTo(distributionMap)
    })

  function getHealthColor(status) {
    const colors = {
      very_poor: "#e74c3c",
      poor: "#f1c40f",
      good: "#2ecc71",
      very_good: "#3498db",
      excellent: "#9b59b6",
    }
    return colors[status] || "#7f8c8d"
  }

  function getHealthLabel(status) {
    const labels = {
      very_poor: "Very Poor",
      poor: "Poor",
      good: "Good",
      very_good: "Very Good",
      excellent: "Excellent",
    }
    return labels[status] || status
  }
})
