document.addEventListener("DOMContentLoaded", () => {
    // Simple table search functionality
    const searchInput = document.getElementById("datasetSearch")
    const table = document.getElementById("datasetsTable")
  
    if (searchInput && table) {
      const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr")
  
      searchInput.addEventListener("keyup", () => {
        const searchTerm = searchInput.value.toLowerCase()
  
        for (let i = 0; i < rows.length; i++) {
          const rowText = rows[i].textContent.toLowerCase()
          if (rowText.indexOf(searchTerm) > -1) {
            rows[i].style.display = ""
          } else {
            rows[i].style.display = "none"
          }
        }
      })
    }
  
    // Table sorting functionality
    const tableHeaders = document.querySelectorAll("#datasetsTable th[data-sort]")
  
    tableHeaders.forEach((header) => {
      header.addEventListener("click", function () {
        const sortBy = this.dataset.sort
        const sortDirection = this.classList.contains("sort-asc") ? "desc" : "asc"
  
        // Remove sort classes from all headers
        tableHeaders.forEach((h) => {
          h.classList.remove("sort-asc", "sort-desc")
        })
  
        // Add sort class to current header
        this.classList.add(`sort-${sortDirection}`)
  
        // Sort the table
        sortTable(sortBy, sortDirection)
      })
    })
  
    function sortTable(sortBy, direction) {
      const tbody = document.querySelector("#datasetsTable tbody")
      const rows = Array.from(tbody.querySelectorAll("tr"))
  
      // Sort the rows
      rows.sort((a, b) => {
        const aValue =
          a.querySelector(`td[data-${sortBy}]`).dataset[sortBy] ||
          a.querySelector(`td[data-${sortBy}]`).textContent.trim()
        const bValue =
          b.querySelector(`td[data-${sortBy}]`).dataset[sortBy] ||
          b.querySelector(`td[data-${sortBy}]`).textContent.trim()
  
        // Check if values are numbers
        const aNum = Number.parseFloat(aValue)
        const bNum = Number.parseFloat(bValue)
  
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return direction === "asc" ? aNum - bNum : bNum - aNum
        }
  
        // Otherwise sort as strings
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      })
  
      // Remove all rows from the table
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild)
      }
  
      // Add sorted rows back to the table
      rows.forEach((row) => {
        tbody.appendChild(row)
      })
    }
  
    // Export functionality
    const exportButton = document.getElementById("exportDataBtn")
  
    if (exportButton) {
      exportButton.addEventListener("click", () => {
        const format = document.getElementById("exportFormat").value
        exportData(format)
      })
    }
  
    function exportData(format) {
      const table = document.getElementById("datasetsTable")
      if (!table) return
  
      const rows = table.querySelectorAll("tbody tr")
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim())
  
      // Prepare data array
      const data = []
      rows.forEach((row) => {
        const rowData = {}
        const cells = row.querySelectorAll("td")
        cells.forEach((cell, index) => {
          rowData[headers[index]] = cell.textContent.trim()
        })
        data.push(rowData)
      })
  
      switch (format) {
        case "csv":
          exportCSV(data, headers)
          break
        case "json":
          exportJSON(data)
          break
        case "excel":
          exportExcel(data, headers)
          break
        default:
          exportCSV(data, headers)
      }
    }
  
    function exportCSV(data, headers) {
      let csv = headers.join(",") + "\n"
  
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || ""
          // Escape quotes and wrap in quotes if contains comma
          return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value
        })
        csv += values.join(",") + "\n"
      })
  
      downloadFile(csv, "endemic-trees-data.csv", "text/csv")
    }
  
    function exportJSON(data) {
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, "endemic-trees-data.json", "application/json")
    }
  
    function exportExcel(data, headers) {
      // Simple Excel export (actually CSV with Excel MIME type)
      let csv = headers.join(",") + "\n"
  
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header] || ""
          return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value
        })
        csv += values.join(",") + "\n"
      })
  
      downloadFile(csv, "endemic-trees-data.xls", "application/vnd.ms-excel")
    }
  
    function downloadFile(content, fileName, mimeType) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
  
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
  
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    }
  })
  