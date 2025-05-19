// Import jsPDF
const { jsPDF } = window.jspdf;

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
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value

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
    generateReportBtn.addEventListener("click", async () => {
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

      try {
        // Send form data to server
        const response = await fetch('/generate-report/', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken,
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to generate report');
        }

        // Update preview with server response
        reportPreviewContent.innerHTML = data.reportContent;

        // Initialize charts and map if needed
        if (formData.get("include_charts") === "on") {
          initReportCharts(reportType);
        }
        
        if (formData.get("include_map") === "on") {
          initReportMap();
        }

        // Enable print and download buttons
        printReportBtn.disabled = false;
        downloadReportBtn.disabled = false;

      } catch (error) {
        console.error('Error:', error);
        reportPreviewContent.innerHTML = `
          <div class="alert alert-danger" role="alert">
            An error occurred while generating the report. Please try again.
          </div>
        `;
      }
    })
  }

  // Print report button click handler
  if (printReportBtn) {
    printReportBtn.addEventListener("click", () => {
      const content = document.getElementById('reportPreviewContent');
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = content.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      
      // Reinitialize the page
      location.reload();
    })
  }

  // Download report button click handler
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", async () => {
      try {
        const reportElement = document.querySelector('.report-document');
        if (!reportElement) return;

        // Create canvas from the report content
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('endemic_trees_report.pdf');

      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error downloading report. Please try again.');
      }
    })
  }

  // Function to initialize report charts
  function initReportCharts(reportType) {
    const ctx1 = document.getElementById('reportChart1')?.getContext('2d');
    const ctx2 = document.getElementById('reportChart2')?.getContext('2d');

    if (ctx1) {
      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sample Data',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    if (ctx2) {
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Trend',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true
        }
      });
    }
  }

  // Function to initialize report map
  function initReportMap() {
    const mapContainer = document.getElementById('reportMap');
    if (!mapContainer) return;

    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
      const map = L.map(mapContainer).setView([10.3157, 123.8854], 10);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add sample markers
      L.marker([10.3157, 123.8854])
        .bindPopup('Sample Location 1')
        .addTo(map);
    } else {
      mapContainer.innerHTML = '<div class="alert alert-warning">Map functionality is currently unavailable.</div>';
    }
  }
})
