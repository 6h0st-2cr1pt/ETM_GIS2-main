document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone")
  const fileInput = document.getElementById("csv_file")
  const fileInfo = document.getElementById("selected-file-info")
  const uploadBtn = document.getElementById("upload-csv-btn")

  // File input change handler
  fileInput.addEventListener("change", function () {
    handleFileSelect(this.files)
  })

  // Drag and drop handlers
  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault()
    e.stopPropagation()
    this.classList.add("drag-over")
  })

  dropzone.addEventListener("dragleave", function (e) {
    e.preventDefault()
    e.stopPropagation()
    this.classList.remove("drag-over")
  })

  dropzone.addEventListener("drop", function (e) {
    e.preventDefault()
    e.stopPropagation()
    this.classList.remove("drag-over")

    const files = e.dataTransfer.files
    fileInput.files = files
    handleFileSelect(files)
  })

  function handleFileSelect(files) {
    if (files.length > 0) {
      const file = files[0]

      // Check if file is CSV
      if (file.name.endsWith(".csv")) {
        fileInfo.innerHTML = `
                    <div class="selected-file-details">
                        <i class="fas fa-file-csv"></i>
                        <span>${file.name} (${formatFileSize(file.size)})</span>
                    </div>
                `
        uploadBtn.disabled = false
      } else {
        fileInfo.innerHTML = `
                    <div class="selected-file-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Please select a CSV file</span>
                    </div>
                `
        uploadBtn.disabled = true
      }
    } else {
      fileInfo.innerHTML = "<p>No file selected</p>"
      uploadBtn.disabled = true
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Dynamic filtering for genus based on selected family
  const familySelect = document.getElementById("family")
  const genusSelect = document.getElementById("genus")

  if (familySelect && genusSelect) {
    familySelect.addEventListener("change", function () {
      const familyId = this.value

      // Hide all genus options
      Array.from(genusSelect.options).forEach((option) => {
        if (option.value === "") return // Skip the placeholder option

        const optionFamilyId = option.getAttribute("data-family")
        if (optionFamilyId === familyId) {
          option.style.display = ""
        } else {
          option.style.display = "none"
        }
      })

      // Reset genus selection
      genusSelect.value = ""
    })
  }
})

// Make sure the form fits in the viewport
document.addEventListener("DOMContentLoaded", () => {
  // Adjust height of scrollable areas if needed
  function adjustHeight() {
    const windowHeight = window.innerHeight
    const headerHeight = document.querySelector("header") ? document.querySelector("header").offsetHeight : 0
    const pageTitle = document.querySelector(".page-title").offsetHeight
    const padding = 40 // Account for container padding

    const availableHeight = windowHeight - headerHeight - pageTitle - padding

    // Set max-height for the upload content
    document.querySelector(".upload-content").style.maxHeight = `${availableHeight}px`
  }

  // Run on load and resize
  adjustHeight()
  window.addEventListener("resize", adjustHeight)
})
