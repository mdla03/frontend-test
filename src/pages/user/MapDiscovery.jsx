import { useEffect, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, ScaleControl, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

const BGC_CENTER = [14.5514, 121.0509]
// Same keyless geocoder the create-event venue search uses; debounced to respect
// Nominatim's ~1 req/sec policy.
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search'

const RADIUS_OPTIONS = [
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
]

// Haversine — good enough for "how far is this event" labels.
function distanceMeters([lat1, lng1], [lat2, lng2]) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'Sports', label: 'Sports', icon: 'sports_soccer' },
  { key: 'Lifestyle', label: 'Lifestyle', icon: 'self_improvement' },
  { key: 'Community', label: 'Community', icon: 'diversity_3' },
  { key: 'Networking', label: 'Networking', icon: 'groups' },
  { key: 'Others', label: 'Others', icon: 'apps' },
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

// Marks what the radius is measured from — without it the circle reads as arbitrary.
function centerIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="w-3 h-3 rounded-full bg-primary ring-2 ring-white shadow"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

// Keep the whole search circle in view. toBounds() takes the box's full width,
// so radius * 2 is the circle's bounding box; the extra top padding clears the
// floating search bar and category chips.
function FitRadius({ center, radius }) {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    map.flyToBounds(L.latLng(center).toBounds(radius * 2), {
      paddingTopLeft: [40, 150],
      paddingBottomRight: [40, 50],
    })
  }, [center, radius, map])
  return null
}

// Selecting from the list should bring its pin into view.
function PanTo({ position }) {
  const map = useMap()
  useEffect(() => {
    map.panTo(position)
  }, [position[0], position[1], map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function MapDiscovery() {
  const [pins, setPins] = useState([])
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState(null)
  const [userPosition, setUserPosition] = useState(null)
  const [center, setCenter] = useState(BGC_CENTER)
  const [radius, setRadius] = useState(10000)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [searching, setSearching] = useState(false)
  // Picking a suggestion rewrites the query, which would otherwise re-trigger the search.
  const skipSearch = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get('/events/nearby', { params: { lat: center[0], lng: center[1], radius } })
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
  }, [center, radius])

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }
    if (query.trim().length < 3) {
      setPlaces([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`${GEOCODE_URL}?format=json&limit=5&q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        setPlaces(await res.json())
      } catch {
        // Aborted or offline — leave the previous suggestions alone.
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function choosePlace(place) {
    skipSearch.current = true
    setQuery(place.display_name)
    setPlaces([])
    setSelected(null)
    setCenter([Number(place.lat), Number(place.lon)])
  }

  function handleNearMe() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = [pos.coords.latitude, pos.coords.longitude]
        setUserPosition(here)
        setCenter(here)
      },
      () => setCenter(BGC_CENTER),
    )
  }

  const filteredPins = pins
    .filter((p) => category === 'all' || p.category === category)
    .map((p) => ({ ...p, distance: distanceMeters(center, [p.lat, p.lng]) }))
    .filter((p) => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance)

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 overflow-hidden bg-surface-container-low flex">
      {/* Event list — filtered by the same category chips and radius as the map. */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 h-full bg-surface-container-lowest border-r border-surface-container-high">
        <div className="px-5 py-4 border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface font-bold">
            {filteredPins.length} event{filteredPins.length === 1 ? '' : 's'} nearby
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            {category === 'all' ? 'All categories' : category} · within{' '}
            {RADIUS_OPTIONS.find((r) => r.value === radius)?.label}
          </p>
        </div>
        <ul className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {filteredPins.length === 0 && (
            <li className="px-3 py-6 text-center font-body-sm text-body-sm text-on-surface-variant">
              No events here yet. Try a wider radius or another category.
            </li>
          )}
          {filteredPins.map((pin) => {
            const open = selected?.id === pin.id
            return (
              <li
                key={pin.id}
                className={`rounded-xl transition-colors ${open ? 'bg-secondary-container' : 'hover:bg-surface-container-low'}`}
              >
                <button
                  className="w-full text-left px-3 py-2.5"
                  aria-expanded={open}
                  onClick={() => setSelected(open ? null : pin)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{pin.title}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                      {formatDistance(pin.distance)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">location_on</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{pin.venue}</span>
                  </div>
                  {pin.schedule && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{pin.schedule}</span>
                  )}
                </button>

                {open && (
                  <div className="px-3 pb-3 flex flex-col gap-2">
                    {pin.category && (
                      <span className="self-start px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-bold">
                        {pin.category}
                      </span>
                    )}
                    {pin.description && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{pin.description}</p>
                    )}
                    <button
                      className="mt-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                      onClick={() => navigate(`/events/${pin.id}`)}
                    >
                      View Details &amp; Register
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </aside>

      <div className="relative flex-1 h-full">
      <MapContainer center={BGC_CENTER} zoom={14} zoomControl={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Lets the drawn radius be checked against a real distance scale. */}
        <ScaleControl position="bottomleft" imperial={false} />
        {userPosition && <Marker position={userPosition} icon={userIcon()} />}
        <Circle
          center={center}
          radius={radius}
          pathOptions={{ color: '#166534', weight: 2, fillColor: '#22c55e', fillOpacity: 0.08 }}
        />
        <Marker position={center} icon={centerIcon()} />
        <FitRadius center={center} radius={radius} />
        {selected && <PanTo position={[selected.lat, selected.lng]} />}
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
          {/* relative + z-20 keeps the suggestion dropdown above the chips below it. */}
          <div className="relative z-20 flex items-center gap-3 w-full bg-surface-container-lowest/95 backdrop-blur-xl p-2 rounded-2xl shadow-xl">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-primary text-[22px]">
                {searching ? 'progress_activity' : 'search'}
              </span>
              <input
                className="w-full pl-11 pr-10 py-2.5 bg-transparent rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none"
                placeholder="Search a city, building, or venue..."
                type="text"
                value={query}
                autoComplete="off"
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="absolute right-2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  onClick={() => {
                    setQuery('')
                    setPlaces([])
                  }}
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
              {places.length > 0 && (
                <ul className="absolute z-[1001] left-0 right-0 top-full mt-2 max-h-64 overflow-y-auto bg-surface-container-lowest rounded-xl shadow-2xl p-1">
                  {places.map((place) => (
                    <li key={place.place_id}>
                      <button
                        className="w-full flex items-start gap-2 text-left px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
                        onClick={() => choosePlace(place)}
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">location_on</span>
                        <span className="font-body-sm text-body-sm text-on-surface">{place.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <select
              className="shrink-0 h-10 px-3 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Search radius"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  Within {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative z-10 flex items-center gap-2 overflow-x-auto py-1">
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
      <div className="absolute right-4 bottom-24 lg:bottom-8 z-[1000] flex flex-col items-center gap-2">
        <button
          className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center hover:bg-surface-container-high"
          onClick={handleNearMe}
          title="Recenter on my location"
        >
          <span className="material-symbols-outlined text-[24px]">my_location</span>
        </button>
      </div>

      </div>
    </div>
  )
}
