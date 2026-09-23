import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../../components/EventCard'
import { api } from '../../lib/api'

const CATEGORIES = ['Life Skills', 'Wellness', 'Career Growth', 'Icebreakers', 'Social']
const MODALITIES = [
  { key: 'in-person', label: 'In-Person', icon: 'location_on' },
  { key: 'virtual', label: 'Virtual', icon: 'videocam' },
  { key: 'hybrid', label: 'Hybrid', icon: 'hub' },
]

const initialForm = {
  title: '',
  description: '',
  event_category: CATEGORIES[0],
  modality: 'in-person',
  address: '',
  start_date: '',
  start_time: '',
  capacity: 20,
  reward_type: '',
  img_url: '',
}

export default function CreateEvent() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave(status) {
    if (!form.title || !form.start_date) {
      setError('Title and event date are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/events', { ...form, status })
      navigate('/organizer')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Could not save this event.')
    } finally {
      setSubmitting(false)
    }
  }

  const previewDate = form.start_date ? new Date(form.start_date) : null

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
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors disabled:opacity-50"
            onClick={() => handleSave('draft')}
            disabled={submitting}
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
            <span>Save as Draft</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-secondary transition-all disabled:opacity-50"
            onClick={() => handleSave('submitted')}
            disabled={submitting}
          >
            <span>Submit for HR Approval</span>
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
                    className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                      form.event_category === c ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
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
              <label className="font-label-md text-label-md text-on-surface">Event Description</label>
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

            <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-lg">
              {MODALITIES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1 transition-colors ${
                    form.modality === m.key ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' : 'text-tertiary hover:text-on-surface'
                  }`}
                  onClick={() => update('modality', m.key)}
                >
                  <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">
                  Event Date <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update('start_date', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Start Time</label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => update('start_time', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface">Venue / Address</label>
              <input
                className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="12F Town Hall, Manulife BGC Tower"
              />
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
                <label className="font-label-md text-label-md text-on-surface">Max Slot Capacity</label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => update('capacity', Number(e.target.value))}
                />
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
              <label className="font-label-md text-label-md text-on-surface">Cover Image URL</label>
              <input
                className="w-full h-12 px-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm"
                type="text"
                value={form.img_url}
                onChange={(e) => update('img_url', e.target.value)}
                placeholder="https://…"
              />
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
