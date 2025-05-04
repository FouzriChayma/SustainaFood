"use client"

import { useState, useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "../assets/styles/LocationPicker.css"

const LocationPicker = ({ isOpen, onClose, onLocationChange, onAddressChange, onSelect, initialAddress }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const modalRef = useRef(null)
  const [location, setLocation] = useState({ type: "Point", coordinates: [10.1658, 36.8188] })
  const [address, setAddress] = useState(initialAddress || "")

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("map-open")
      document.body.style.overflow = "hidden"
    } else {
      document.body.classList.remove("map-open")
      document.body.style.overflow = ""
    }

    return () => {
      document.body.classList.remove("map-open")
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !mapContainer.current) return;

    console.log("Map container dimensions:", {
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight,
    });

    const timer = setTimeout(() => {
      if (!map.current && mapContainer.current) {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [
              {
                id: "osm",
                type: "raster",
                source: "osm",
              },
            ],
          },
          center: location.coordinates,
          zoom: 12,
        })

        map.current.addControl(new maplibregl.NavigationControl())

        map.current.on("load", () => {
          marker.current = new maplibregl.Marker({ draggable: true, color: "#FF0000" })
            .setLngLat(location.coordinates)
            .addTo(map.current)

          marker.current.on("dragend", () => {
            const { lng, lat } = marker.current.getLngLat()
            updateLocation(lng, lat)
          })

          map.current.on("click", (e) => {
            const { lng, lat } = e.lngLat
            marker.current.setLngLat([lng, lat])
            updateLocation(lng, lat)
          })

          if (!address && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              ({ coords }) => updateLocation(coords.longitude, coords.latitude, true),
              () => alert("Geolocation failed. Defaulting to Tunis."),
            )
          }

          // Force map resize after initialization
          setTimeout(() => {
            map.current.resize();
          }, 100);
        })
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isOpen, address])

  const updateLocation = async (lng, lat, move = false) => {
    const newLoc = { type: "Point", coordinates: [lng, lat] }
    setLocation(newLoc)
    onLocationChange?.(newLoc)

    const addr = await reverseGeocode(lng, lat)
    setAddress(addr)
    onAddressChange?.(addr)

    if (move && map.current) map.current.flyTo({ center: [lng, lat], zoom: 15 })
  }

  const geocodeAddress = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        const lng = Number.parseFloat(lon)
        const latNum = Number.parseFloat(lat)
        marker.current?.setLngLat([lng, latNum])
        map.current?.flyTo({ center: [lng, latNum], zoom: 15 })
        updateLocation(lng, latNum)
      } else {
        alert("Adresse introuvable.")
      }
    } catch (err) {
      alert("Échec de la géolocalisation par adresse.")
    }
  }

  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}`)
      const data = await res.json()
      return data.display_name || "Lieu inconnu"
    } catch {
      return "Lieu inconnu"
    }
  }

  if (!isOpen) return null

  return (
    <div className="location-picker-modal-backdrop">
      <div className="location-picker-modal-container" ref={modalRef}>
        <div className="location-picker-modal-header">
          <input
            className="location-picker-search-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Entrer une adresse"
          />
          <button className="location-picker-search-button" onClick={() => geocodeAddress(address)}>
            Rechercher
          </button>
          <button
            className="location-picker-geolocation-button"
            onClick={() =>
              navigator.geolocation.getCurrentPosition(
                ({ coords }) => updateLocation(coords.longitude, coords.latitude, true),
                () => alert("Échec de la géolocalisation."),
              )
            }
          >
            📍
          </button>
        </div>
        <div ref={mapContainer} className="location-picker-map-container" />
        <div className="location-picker-modal-footer">
          <button className="location-picker-cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="location-picker-confirm-button" onClick={() => onSelect(location, address)}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker