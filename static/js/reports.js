import { Chart } from "@/components/ui/chart"
// Import Leaflet library
var L = L || {}

// Import html2canvas library
var html2canvas = html2canvas || {}

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const reportForm = document.getElementById("reportForm")
  const timeRange = document.getElementById("timeRange")
  const customTimeRange = document.querySelector(".custom-time-range")
  const generateReportBtn = document.getElementById("generateReportBtn")
  const printReportBtn = document.getElementById("printReportBtn")
  const downloadReportBtn = document.getElementById("downloadReportBtn")
  const reportPreviewContent = document.getElementById("reportPreviewContent")

  // Show/hide custom time range based on selection
  if (timeRange) {
    timeRange.addEventListener("change", function () {
      if (this.value === "custom") {
        customTimeRange.classList.remove("d-none")
      } else {
        customTimeRange.classList.add("d-none")
      }
    })
  }

  // Generate report button click handler
  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", () => {
      // Get form data
      const formData = new FormData(reportForm)
      const reportType = formData.get("report_type")

      if (!reportType) {
        alert("Please select a report type.")
        return
      }

      // Show loading state
      reportPreviewContent.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `

      // Simulate API request
      setTimeout(() => {
        // Generate report content based on type
        const reportContent = generateReportContent(reportType, formData)

        // Update preview
        reportPreviewContent.innerHTML = reportContent

        // Enable print and download buttons
        printReportBtn.disabled = false
        downloadReportBtn.disabled = false
      }, 1000)
    })
  }

  // Print report button click handler
  if (printReportBtn) {
    printReportBtn.addEventListener("click", () => {
      printReport()
    })
  }

  // Download report button click handler
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", () => {
      downloadReport()
    })
  }

  // Function to generate report content based on type
  function generateReportContent(reportType, formData) {
    const date = new Date()
    const dateStr = date.toLocaleDateString()
    const timeStr = date.toLocaleTimeString()

    // Get form data
    const timeRange = formData.get("time_range")
    const speciesFilter = formData.get("species_filter")
    const includeCharts = formData.get("include_charts") === "on"
    const includeMap = formData.get("include_map") === "on"
    const includeTable = formData.get("include_table") === "on"

    // Report title based on type
    let reportTitle = ""
    switch (reportType) {
      case "species_distribution":
        reportTitle = "Species Distribution Report"
        break
      case "population_trends":
        reportTitle = "Population Trends Report"
        break
      case "health_analysis":
        reportTitle = "Health Status Analysis Report"
        break
      case "conservation_status":
        reportTitle = "Conservation Status Report"
        break
      case "spatial_density":
        reportTitle = "Spatial Density Report"
        break
      default:
        reportTitle = "Endemic Trees Report"
    }

    // Begin report HTML
    let html = `
      <div class="report-document">
        <div class="report-header">
          <h1 class="report-title">${reportTitle}</h1>
          <p class="report-subtitle">Endemic Trees Monitoring System</p>
          <p class="report-date">Generated on ${dateStr} at ${timeStr}</p>
        </div>
        
        <div class="report-section">
          <h2 class="report-section-title">Executive Summary</h2>
          <p>This report provides an analysis of endemic tree data collected by the Endemic Trees Monitoring System. The report includes information on tree species, population trends, health status, and spatial distribution.</p>
          <p>The data in this report is based on ${timeRange === "all" ? "all available data" : timeRange === "last_5" ? "the last 5 years" : timeRange === "last_10" ? "the last 10 years" : "a custom time range"}.</p>
        </div>
    `

    // Add charts section if included
    if (includeCharts) {
      html += `
        <div class="report-section">
          <h2 class="report-section-title">Data Visualization</h2>
          <div class="report-chart-container">
            <canvas id="reportChart1"></canvas>
          </div>
          <div class="report-chart-container">
            <canvas id="reportChart2"></canvas>
          </div>
        </div>
      `
    }

    // Add map section if included
    if (includeMap) {
      html += `
        <div class="report-section">
          <h2 class="report-section-title">Spatial Distribution</h2>
          <div class="report-map-container" id="reportMap"></div>
        </div>
      `
    }

    // Add data table if included
    if (includeTable) {
      html += `
        <div class="report-section">
          <h2 class="report-section-title">Data Table</h2>
          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Location</th>
                  <th>Population</th>
                  <th>Year</th>
                  <th>Health Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tindalo (Afzelia rhomboidea)</td>
                  <td>Negros Island</td>
                  <td>120</td>
                  <td>2023</td>
                  <td>Good</td>
                </tr>
                <tr>
                  <td>Molave (Vitex parviflora)</td>
                  <td>Negros Island</td>
                  <td>85</td>
                  <td>2023</td>
                  <td>Very Good</td>
                </tr>
                <tr>
                  <td>Narra (Pterocarpus indicus)</td>
                  <td>Negros Island</td>
                  <td>95</td>
                  <td>2023</td>
                  <td>Excellent</td>
                </tr>
                <tr>
                  <td>Kamagong (Diospyros discolor)</td>
                  <td>Negros Island</td>
                  <td>45</td>
                  <td>2023</td>
                  <td>Poor</td>
                </tr>
                <tr>
                  <td>Yakal (Shorea astylosa)</td>
                  <td>Negros Island</td>
                  <td>65</td>
                  <td>2023</td>
                  <td>Good</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `
    }

    // Add conclusions
    html += `
      <div class="report-section">
        <h2 class="report-section-title">Conclusions and Recommendations</h2>
        <p>Based on the data collected and analyzed in this report, the following conclusions can be drawn:</p>
        <ul>
          <li>The overall population of endemic trees has shown a ${reportType === "population_trends" ? "positive" : "stable"} trend over the observed period.</li>
          <li>Species with "Excellent" and "Very Good" health status make up approximately 45% of the total tree population.</li>
          <li>There is a need for increased conservation efforts in areas with lower tree density.</li>
        </ul>
        <p>Recommendations for future actions include:</p>
        <ul>
          <li>Focus conservation efforts on species with "Poor" and "Very Poor" health status.</li>
          <li>Implement monitoring programs in underrepresented areas.</li>
          <li>Develop targeted conservation strategies for species with declining populations.</li>
        </ul>
      </div>
    `

    // Close the report document
    html += `</div>`

    // Add script to initialize charts and map after the content is added to the DOM
    setTimeout(() => {
      if (includeCharts) {
        initReportCharts(reportType)
      }

      if (includeMap) {
        initReportMap()
      }
    }, 100)

    return html
  }

  // Function to initialize charts
  function initReportCharts(reportType) {
    // Chart 1 - Species Distribution or Population Trends
    const ctx1 = document.getElementById("reportChart1")
    if (ctx1) {
      new Chart(ctx1, {
        type: reportType === "species_distribution" ? "pie" : "line",
        data: {
          labels: ["Tindalo", "Molave", "Narra", "Kamagong", "Yakal"],
          datasets: [
            {
              label: reportType === "species_distribution" ? "Number of Trees" : "Population Over Time",
              data: [120, 85, 95, 45, 65],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
              borderColor: reportType === "species_distribution" ? "" : "#36A2EB",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    }

    // Chart 2 - Health Status Distribution
    const ctx2 = document.getElementById("reportChart2")
    if (ctx2) {
      new Chart(ctx2, {
        type: reportType === "health_analysis" ? "bar" : "doughnut",
        data: {
          labels: ["Very Poor", "Poor", "Good", "Very Good", "Excellent"],
          datasets: [
            {
              label: "Health Status Distribution",
              data: [10, 35, 120, 85, 60],
              backgroundColor: ["#E74A3B", "#F6C23E", "#4E73DF", "#1CC88A", "#36B9CC"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    }
  }

  // Function to initialize map
  function initReportMap() {
    const mapContainer = document.getElementById("reportMap")
    if (mapContainer) {
      // Create a map centered on Negros Island
      const map = L.map(mapContainer, {
        center: [10.0, 123.0],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      })

      // Add OpenStreetMap base layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      // Add sample tree markers
      const treeLocations = [
        { lat: 10.0, lng: 123.0, name: "Tindalo", population: 120 },
        { lat: 10.1, lng: 123.1, name: "Molave", population: 85 },
        { lat: 9.9, lng: 122.9, name: "Narra", population: 95 },
        { lat: 10.2, lng: 123.2, name: "Kamagong", population: 45 },
        { lat: 9.8, lng: 123.0, name: "Yakal", population: 65 },
      ]

      treeLocations.forEach((loc) => {
        L.circleMarker([loc.lat, loc.lng], {
          radius: Math.sqrt(loc.population) / 2,
          fillColor: "#4e73df",
          color: "#ffffff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindTooltip(`${loc.name} (${loc.population} trees)`)
          .addTo(map)
      })
    }
  }

  // Function to print report
  function printReport() {
    window.print()
  }

  // Function to download report as PDF
  function downloadReport() {
    const { jsPDF } = window.jspdf

    // Create new PDF document
    const doc = new jsPDF("p", "mm", "a4")
    const reportContent = document.getElementById("reportPreviewContent")

    // Use html2canvas to capture the report content
    html2canvas(reportContent).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      doc.save("endemic_trees_report.pdf")
    })
  }
})
