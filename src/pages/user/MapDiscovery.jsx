import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

const BGC_CENTER = [14.5514, 121.0509]

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'Icebreakers', label: 'Icebreakers & Social', icon: 'diversity_3' },
  { key: 'Life Skills', label: 'Life Skills', icon: 'lightbulb' },
  { key: 'Wellness', label: 'Wellness', icon: 'self_improvement' },
  { key: 'Career Growth', label: 'Career Growth', icon: 'trending_up' },
]

function pinIcon(icon, active) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${active ? 44 : 34}px;height:${active ? 44 : 34}px" class="rounded-full ${active ? 'bg-primary ring-4 ring-secondary-container' : 'bg-primary-container'} shadow-lg flex items-center justify-center text-white">
      <span class="material-symbols-outlined" style="font-size:${active ? 22 : 16}px">${icon}</span>
    </div>`,
    iconSize: [active ? 44 : 34, active ? 44 : 34],
    iconAnchor: [active ? 22 : 17, active ? 22 : 17],
  })
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="relative"><div class="absolute -inset-3 rounded-full bg-secondary-container/50 animate-ping"></div><div class="relative w-4 h-4 rounded-full bg-primary-container ring-2 ring-white shadow"></div></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function FlyTo({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 16)
  }, [position, map])
  return null
}

export default function MapDiscovery() {
  const [pins, setPins] = useState([])
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState(null)
  const [userPosition, setUserPosition] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/events/nearby', { params: { lat: BGC_CENTER[0], lng: BGC_CENTER[1], radius: 20000 } })
      .then((res) => {
        const data = res.data.data ?? []
        setPins(
          data
            .filter((e) => e.latitude && e.longitude)
            .map((e) => ({
              id: e.id,
              lat: e.latitude,
              lng: e.longitude,
              icon: 'event',
              category: e.event_category,
              title: e.title,
              venue: e.address,
              description: e.description,
              schedule: e.start_time ? `${e.start_date} · ${e.start_time}` : e.start_date,
            })),
        )
      })
      .catch(() => {})
  }, [])

  function handleNearMe() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPosition(BGC_CENTER),
    )
  }

  const filteredPins = category === 'all' ? pins : pins.filter((p) => p.category === category)

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 overflow-hidden bg-surface-container-low">
      <MapContainer center={BGC_CENTER} zoom={14} zoomControl={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon()} />
            <FlyTo position={userPosition} />
          </>
        )}
        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={pinIcon(pin.icon ?? 'event', selected?.id === pin.id)}
            eventHandlers={{ click: () => setSelected(pin) }}
          />
        ))}
      </MapContainer>

      {/* Floating top controls */}
      <div className="absolute top-4 left-0 right-0 z-[1000] px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center gap-3 w-full bg-surface-container-lowest/95 backdrop-blur-xl p-2 rounded-2xl shadow-xl">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-primary text-[22px]">search</span>
              <input
                className="w-full pl-11 pr-4 py-2.5 bg-transparent rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none"
                placeholder="Search workshop, host, building, or venue..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md whitespace-nowrap shadow-sm"
              onClick={handleNearMe}
            >
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              Near Me
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm transition-colors ${
                  category === c.key ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:bg-surface-container'
                }`}
                onClick={() => setCategory(c.key)}
              >
                <span className="material-symbols-outlined text-[16px] text-primary">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating zoom/locate controls */}
      <div className="absolute right-4 bottom-72 md:bottom-28 z-[1000] flex flex-col items-center gap-2">
        <button
          className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center hover:bg-surface-container-high"
          onClick={handleNearMe}
          title="Recenter on my location"
        >
          <span className="material-symbols-outlined text-[24px]">my_location</span>
        </button>
      </div>

      {pins.length === 0 && (
        <div className="absolute top-32 md:top-24 left-4 z-[999] bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full font-label-sm text-label-sm text-on-surface-variant shadow">
          No approved events with a location yet.
        </div>
      )}

      {/* Bottom sheet */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 md:left-8 md:max-w-2xl z-[1000]">
          <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container" />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                {selected.category && (
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                    {selected.category}
                  </span>
                )}
                {selected.schedule && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    {selected.schedule}
                  </span>
                )}
                {selected.slotsLeft && (
                  <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                    {selected.slotsLeft}
                  </span>
                )}
              </div>
              <button
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
                onClick={() => setSelected(null)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{selected.title}</h2>
            {selected.host && (
              <div className="flex items-center gap-2 mt-1 font-label-md text-label-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                <span>
                  Hosted by <strong className="text-on-surface">{selected.host}</strong>
                </span>
              </div>
            )}

            {selected.venue && (
              <div className="flex items-center gap-2 mt-3 text-on-surface font-body-sm text-body-sm bg-surface-container-low/70 px-3 py-2 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-primary shrink-0">location_on</span>
                <span className="font-label-md text-label-md font-semibold">{selected.venue}</span>
              </div>
            )}

            {selected.description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 line-clamp-2">{selected.description}</p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                className="flex-1 py-3 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md"
                onClick={() => navigate(`/events/${selected.id}`)}
              >
                <span>View Details & Register</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
