document.addEventListener("DOMContentLoaded", () => {
    // Initialize the preview map
    const previewMap = L.map("previewMap", {
      center: [10.0, 123.0],
      zoom: 8,
    })
  
    // Add OpenStreetMap dark theme from CartoDB as the base layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(previewMap)
  
    // Layer preview functionality
    const previewLayerSelect = document.getElementById("previewLayerSelect")
    let currentPreviewLayer = null
  
    if (previewLayerSelect) {
      previewLayerSelect.addEventListener("change", function () {
        const layerId = this.value
  
        // Remove current preview layer if exists
        if (currentPreviewLayer) {
          previewMap.removeLayer(currentPreviewLayer)
          currentPreviewLayer = null
        }
  
        if (layerId) {
          // Fetch layer details
          fetch(`/api/layers/${layerId}/`)
            .then((response) => response.json())
            .then((layer) => {
              // Add the layer to the preview map based on its type
              switch (layer.type) {
                case "tile":
                  currentPreviewLayer = L.tileLayer(layer.url, {
                    attribution: layer.attribution,
                    maxZoom: 19,
                  }).addTo(previewMap)
                  break
                case "wms":
                  currentPreviewLayer = L.tileLayer
                    .wms(layer.url, {
                      layers: layer.wms_layers,
                      format: "image/png",
                      transparent: true,
                      attribution: layer.attribution,
                    })
                    .addTo(previewMap)
                  break
                case "geojson":
                  fetch(layer.url)
                    .then((response) => response.json())
                    .then((geojson) => {
                      currentPreviewLayer = L.geoJSON(geojson, {
                        style: {
                          color: "#ff7800",
                          weight: 2,
                          opacity: 0.65,
                        },
                      }).addTo(previewMap)
                      previewMap.fitBounds(currentPreviewLayer.getBounds())
                    })
                  break
                case "vector":
                  // For vector layers, we would need more specific handling
                  // This is a placeholder
                  break
              }
            })
            .catch((error) => console.error("Error loading layer for preview:", error))
        }
      })
    }
  
    // Add Layer button functionality
    const addLayerBtn = document.getElementById("addLayerBtn")
    const layerFormModal = new bootstrap.Modal(document.getElementById("layerFormModal"))
    const layerForm = document.getElementById("layerForm")
    const saveLayerBtn = document.getElementById("saveLayerBtn")
  
    if (addLayerBtn) {
      addLayerBtn.addEventListener("click", () => {
        // Reset form for new layer
        layerForm.reset()
        document.getElementById("layerId").value = ""
        document.getElementById("layerFormModalLabel").textContent = "Add New Layer"
        layerFormModal.show()
      })
    }
  
    // Edit Layer button functionality
    document.querySelectorAll(".edit-layer-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const layerId = this.getAttribute("data-id")
  
        // Fetch layer details
        fetch(`/api/layers/${layerId}/`)
          .then((response) => response.json())
          .then((layer) => {
            // Populate form with layer data
            document.getElementById("layerId").value = layer.id
            document.getElementById("layerName").value = layer.name
            document.getElementById("layerDescription").value = layer.description
            document.getElementById("layerType").value = layer.type
            document.getElementById("layerUrl").value = layer.url
            document.getElementById("layerAttribution").value = layer.attribution
            document.getElementById("layerIsActive").checked = layer.is_active
            document.getElementById("layerIsDefault").checked = layer.is_default
  
            document.getElementById("layerFormModalLabel").textContent = "Edit Layer"
            layerFormModal.show()
          })
          .catch((error) => console.error("Error fetching layer details:", error))
      })
    })
  
    // Save Layer functionality
    if (saveLayerBtn) {
      saveLayerBtn.addEventListener("click", () => {
        const formData = new FormData(layerForm)
        const layerId = formData.get("layer_id")
  
        const url = layerId ? `/api/layers/${layerId}/` : "/api/layers/"
        const method = layerId ? "PUT" : "POST"
  
        fetch(url, {
          method: method,
          body: formData,
          headers: {
            "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to save layer")
            }
            return response.json()
          })
          .then(() => {
            // Reload page to show updated layers
            window.location.reload()
          })
          .catch((error) => console.error("Error saving layer:", error))
      })
    }
  
    // Delete Layer functionality
    const deleteLayerModal = new bootstrap.Modal(document.getElementById("deleteLayerModal"))
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")
    let layerToDelete = null
  
    document.querySelectorAll(".delete-layer-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        layerToDelete = this.getAttribute("data-id")
        deleteLayerModal.show()
      })
    })
  
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        if (layerToDelete) {
          const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]").value
  
          fetch(`/api/layers/${layerToDelete}/`, {
            method: "DELETE",
            headers: {
              "X-CSRFToken": csrfToken,
            },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete layer")
              }
              // Reload page to show updated layers
              window.location.reload()
            })
            .catch((error) => console.error("Error deleting layer:", error))
        }
      })
    }
  })
  