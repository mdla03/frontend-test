import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard'
import { api } from '../../lib/api'

const CATEGORIES = ['Sports', 'Lifestyle', 'Community', 'Networking', 'Others']
const MODALITIES = [
  { key: 'in-person', label: 'In-Person', icon: 'location_on' },
  { key: 'virtual', label: 'Virtual', icon: 'videocam' },
]
const FEE_TYPES = [
  { key: 'free', label: 'Free', icon: 'volunteer_activism' },
  { key: 'paid', label: 'Paid', icon: 'payments' },
]

const BGC_CENTER = [14.5514, 121.0509]
// OpenStreetMap's geocoder — same project as the tiles, keyless. Debounced to
// respect its ~1 req/sec policy. ponytail: proxy it server-side if volume grows.
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search'

const venueIcon = L.divIcon({
  className: '',
  html: `<div class="w-9 h-9 rounded-full bg-primary shadow-lg flex items-center justify-center text-white">
    <span class="material-symbols-outlined" style="font-size:18px">location_on</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

// Typed coordinates can land off-screen; a dragged pin never does, so only
// recenter when the pin is outside the current view.
function RecenterOnPin({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position && !map.getBounds().contains(position)) map.setView(position, map.getZoom())
  }, [map, position])

  return null
}

function PinPicker({ position, onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  })

  if (!position) return null

  return (
    <Marker
      position={position}
      icon={venueIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng()
          onPick(lat, lng)
        },
      }}
    />
  )
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

// Shown on events saved without a cover image.
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00754A"/><stop offset="1" stop-color="#8BF5B1"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><text x="400" y="235" font-family="system-ui,sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle">Bayanihan</text></svg>`,
  )

// In-person needs a real venue; virtual only needs when it happens.
function requiredFields(isVirtual) {
  const schedule = [
    ['title', 'Event Title'],
    ['start_date', 'Start Date'],
    ['end_date', 'End Date'],
    ['start_time', 'Start Time'],
    ['end_time', 'End Time'],
  ]
  if (isVirtual) return [...schedule, ['address', 'Meeting Link']]
  return [
    ...schedule,
    ['description', 'Event Description'],
    ['event_category', 'Event Category'],
    ['address', 'Venue / Address'],
    ['latitude', 'Map pin'],
    ['longitude', 'Map pin'],
    ['capacity', 'Max Slot Capacity'],
  ]
}

// ponytail: base64 in the img_url text column is a testing shortcut — downscaled
// so rows stay small. Swap for a Supabase Storage upload returning a real URL.
function downscaleToDataUrl(file, maxEdge = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

const initialForm = {
  title: '',
  description: '',
  event_category: CATEGORIES[0],
  modality: 'in-person',
  address: '',
  latitude: '',
  longitude: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  capacity: 20,
  fee_type: 'free',
  reward_type: '',
  img_url: '',
}

export default function CreateEvent() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [places, setPlaces] = useState([])
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()
  // Picking a suggestion rewrites the address, which would otherwise re-trigger the search.
  const skipSearch = useRef(false)
  const addressRef = useRef(null)

  const isVirtual = form.modality === 'virtual'

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }
    if (isVirtual || form.address.trim().length < 3) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`${GEOCODE_URL}?format=json&limit=5&q=${encodeURIComponent(form.address)}`, {
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
  }, [form.address, isVirtual])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function choosePlace(place) {
    skipSearch.current = true
    setPlaces([])
    setForm((f) => ({ ...f, address: place.display_name, latitude: Number(place.lat), longitude: Number(place.lon) }))
  }

  // Switching to virtual drops the venue pin — there is no physical place to map.
  function setModality(key) {
    setForm((f) => (key === 'virtual' ? { ...f, modality: key, latitude: '', longitude: '' } : { ...f, modality: key }))
  }

  async function handleImage(file) {
    if (!file) return
    // `accept` is only a filename hint, so check the real type and size.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Cover image must be a JPEG, PNG, WebP, or GIF file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Cover image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB — that one is ${(file.size / 1024 / 1024).toFixed(1)}MB.`)
      return
    }
    setError(null)
    try {
      update('img_url', await downscaleToDataUrl(file))
    } catch {
      setError('Could not read that image. It may be corrupted.')
    }
  }

  async function handleSave() {
    const missing = requiredFields(isVirtual).filter(([field]) => form[field] === '' || form[field] == null)
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map(([, label]) => label).join(', ')}.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      // Empty inputs must go over as null, not '' — these columns are numeric/date/time.
      await api.post('/events', {
        ...form,
        // A virtual event has no venue to pin.
        latitude: isVirtual || form.latitude === '' ? null : Number(form.latitude),
        longitude: isVirtual || form.longitude === '' ? null : Number(form.longitude),
        end_date: form.end_date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        img_url: form.img_url || FALLBACK_IMAGE,
      })
      navigate('/organizer')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not save this event.')
    } finally {
      setSubmitting(false)
    }
  }

  // Derived rather than cleared in the effect, so a short query hides stale hits.
  const suggestions = isVirtual || form.address.trim().length < 3 ? [] : places

  const previewDate = form.start_date ? new Date(form.start_date) : null
  // Half-typed input like "14." parses to NaN — don't hand that to Leaflet.
  const pinPosition =
    form.latitude !== '' && form.longitude !== '' && !Number.isNaN(Number(form.latitude)) && !Number.isNaN(Number(form.longitude))
      ? [Number(form.latitude), Number(form.longitude)]
      : null

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-sm text-label-sm text-tertiary">My Events</span>
            <span className="text-tertiary text-label-sm">/</span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">New Event</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
            Create New Event
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-secondary transition-all disabled:opacity-50"
            onClick={handleSave}
            disabled={submitting}
          >
            <span>Submit for Approval</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>

      {error && <div className="mb-6 bg-error-container text-on-error-container rounded-lg p-4 font-body-sm text-body-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container text-primary flex items-center justify-center font-label-md text-label-md">1</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Basic Information</h2>
                <p className="font-body-sm text-body-sm text-tertiary">Define the core identity of this gathering</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">
                Event Title <span className="text-error">*</span>
              </label>
              <input
                className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Speed Friending Friday & Board Game Night"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">Event Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${form.event_category === c ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    onClick={() => update('event_category', c)}
                  >
                    {form.event_category === c && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">
                Event Description {!isVirtual && <span className="text-error">*</span>}
              </label>
              <textarea
                className="w-full min-h-[120px] p-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 shadow-sm"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="What should colleagues expect?"
              />
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container text-primary flex items-center justify-center font-label-md text-label-md">2</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Schedule &amp; Venue</h2>
                <p className="font-body-sm text-body-sm text-tertiary">Timing and location details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-lg">
              {MODALITIES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-colors ${form.modality === m.key ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'
                    }`}
                  onClick={() => setModality(m.key)}
                >
                  <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  Start Date <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  End Date <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="date"
                  min={form.start_date || undefined}
                  value={form.end_date}
                  onChange={(e) => update('end_date', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  Start Time <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => update('start_time', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  End Time <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="time"
                  min={form.start_date === form.end_date ? form.start_time || undefined : undefined}
                  value={form.end_time}
                  onChange={(e) => update('end_time', e.target.value)}
                />
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant -mt-2">
              Use the same Start and End Date for a single-day event.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">
                {isVirtual ? 'Meeting Link' : 'Venue / Address'} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  ref={addressRef}
                  className="w-full h-12 px-4 pr-11 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type={isVirtual ? 'url' : 'text'}
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder={isVirtual ? 'https://teams.microsoft.com/l/meetup-join/…' : '12F Town Hall, Manulife BGC Tower'}
                  autoComplete="off"
                />
                {form.address ? (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, address: '', latitude: '', longitude: '' }))
                      addressRef.current?.focus()
                    }}
                    title="Clear address and pin"
                    aria-label="Clear address and pin"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                ) : (
                  !isVirtual && (
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                      {searching ? 'progress_activity' : 'search'}
                    </span>
                  )
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-[500] left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-surface-container-lowest rounded-lg shadow-lg p-1">
                    {suggestions.map((place) => (
                      <li key={place.place_id}>
                        <button
                          type="button"
                          onClick={() => choosePlace(place)}
                          className="w-full flex items-start gap-2 text-left px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">location_on</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{place.display_name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!isVirtual && (
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Type a venue to search the map, or set the pin yourself below.
                </span>
              )}
            </div>

            <div className={`flex-col gap-1.5 ${isVirtual ? 'hidden' : 'flex'}`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <label className="font-label-md text-label-md text-on-surface">
                  Pin on Map <span className="text-error">*</span>
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {pinPosition ? `${pinPosition[0].toFixed(5)}, ${pinPosition[1].toFixed(5)}` : 'Click the map or type coordinates below'}
                </span>
              </div>
              <MapContainer
                center={pinPosition ?? BGC_CENTER}
                zoom={15}
                className="h-72 w-full rounded-lg shadow-sm z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <PinPicker
                  position={pinPosition}
                  onPick={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
                />
                <RecenterOnPin position={pinPosition} />
              </MapContainer>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Latitude</label>
                  <input
                    className="w-full h-11 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={form.latitude}
                    onChange={(e) => update('latitude', e.target.value)}
                    placeholder="14.5547"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Longitude</label>
                  <input
                    className="w-full h-11 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={form.longitude}
                    onChange={(e) => update('longitude', e.target.value)}
                    placeholder="121.0244"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Click the map, drag the pin, or type coordinates. Leave empty to keep this event off the Map.
                </p>
                {(form.latitude !== '' || form.longitude !== '') && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, latitude: '', longitude: '' }))}
                    className="font-label-sm text-label-sm text-primary underline underline-offset-2"
                  >
                    Clear pin
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container text-primary flex items-center justify-center font-label-md text-label-md">3</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Capacity &amp; Rewards</h2>
                <p className="font-body-sm text-body-sm text-tertiary">Attendee limits and recognition type</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  Max Slot Capacity {!isVirtual && <span className="text-error">*</span>}
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => update('capacity', Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  Fee Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 h-12 bg-surface-container-low rounded-lg">
                  {FEE_TYPES.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={`rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-colors ${
                        form.fee_type === f.key
                          ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                          : 'text-tertiary hover:text-on-surface'
                      }`}
                      onClick={() => update('fee_type', f.key)}
                    >
                      <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Reward Type</label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="text"
                  value={form.reward_type}
                  onChange={(e) => update('reward_type', e.target.value)}
                  placeholder="Learning Hours"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">Cover Image</label>
              <div className="flex items-center gap-4 flex-wrap">
                <img
                  src={form.img_url || FALLBACK_IMAGE}
                  alt={form.img_url ? 'Selected cover' : 'Default cover'}
                  className="w-28 h-20 sm:w-40 sm:h-24 object-cover rounded-lg shadow-sm shrink-0 bg-surface-container-low"
                />
                <div className="flex flex-col items-start gap-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      <span>{form.img_url ? 'Replace Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        className="hidden"
                        onChange={(e) => handleImage(e.target.files?.[0])}
                      />
                    </label>
                    {form.img_url && (
                      <button
                        type="button"
                        onClick={() => update('img_url', '')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {form.img_url ? 'Custom cover selected.' : 'Optional — the default cover is used if you skip this.'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Live Preview</span>
            </div>
            <p className="font-body-sm text-body-sm text-tertiary">How this appears to employees</p>
          </div>

          <EventCard
            category={form.event_category}
            img_url={form.img_url || FALLBACK_IMAGE}
            day={previewDate?.toLocaleDateString('en-US', { weekday: 'short' })}
            dateLabel={previewDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            scheduleText={form.start_time || undefined}
            locationText={form.address || undefined}
            title={form.title || 'Untitled event'}
            description={form.description}
            badgeText={form.capacity ? `${form.capacity} slots` : undefined}
          />

          <div className="p-4 rounded-xl bg-surface-container flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[24px] shrink-0">verified_user</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
              This preview reflects how employees will see your event. Once submitted, HR will review it before it appears in
              the discovery feed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
