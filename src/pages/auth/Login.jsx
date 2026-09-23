import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { createDemoToken } from '../../lib/auth'

const demoAccounts = {
  user: { id: 'mark.aquino@manulife.com', name: 'Mark Aquino', email: 'mark.aquino@manulife.com', landing: '/events' },
  organizer: { id: 'liza.reyes@manulife.com', name: 'Liza Reyes', email: 'liza.reyes@manulife.com', landing: '/organizer' },
  admin: { id: 'carlo.santos@manulife.com', name: 'Carlo Santos', email: 'carlo.santos@manulife.com', landing: '/admin' },
}

const roleCards = [
  {
    role: 'user',
    icon: 'diversity_3',
    badge: 'Active Cohort (3,400+ Staff)',
    badgeClass: 'bg-secondary-container/60 text-on-secondary-container',
    iconWrapClass: 'bg-secondary-container/40 text-primary',
    title: 'Employee (User)',
    description: 'Discover life skills workshops, icebreakers, track volunteer hours & earn community rewards.',
    cta: 'Enter as Employee',
  },
  {
    role: 'organizer',
    icon: 'event_note',
    badge: 'Committees & Clubs (24 Active)',
    badgeClass: 'bg-primary-fixed text-on-primary-fixed-variant',
    iconWrapClass: 'bg-primary-fixed/50 text-primary',
    title: 'Organization (Organizer)',
    description: 'Create events, manage attendees, track live registrations & review event details.',
    cta: 'Enter Organizer Portal',
  },
  {
    role: 'admin',
    icon: 'shield_person',
    badge: 'HR People & Culture',
    badgeClass: 'bg-surface-variant text-on-surface',
    iconWrapClass: 'bg-surface-variant text-on-surface',
    title: 'Admin (Platform & HR)',
    description: 'Approve submitted events, manage organizations & users, oversee rewards and company-wide metrics.',
    cta: 'Enter Admin Portal',
  },
]

export default function Login() {
  const [status, setStatus] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleRoleSelect(role) {
    const account = demoAccounts[role]
    setStatus(`Simulating instant access as ${account.name}... Transferring to platform.`)
    login(createDemoToken({ id: account.id, name: account.name, email: account.email, role }))
    setTimeout(() => navigate(account.landing), 500)
  }

  function handleSsoClick() {
    setStatus('Contacting Manulife Okta Gateway (PH Corp SSO)... SSO is not enabled for this demo — use a role card below.')
  }

  return (
    <main className="w-full min-h-screen bg-surface flex flex-col justify-center items-center p-gutter-lg">
      <div className="flex flex-col w-full items-center justify-center py-6 px-4">
        <div className="relative w-full max-w-5xl flex flex-col items-center">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-secondary-container/30 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-10 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary-container" />

            <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-on-primary" fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18L10 6H14L8 18H4Z" fill="currentColor" />
                    <path d="M12 18L18 6H22L16 18H12Z" fill="currentColor" fillOpacity="0.85" />
                    <circle cx="20" cy="18" fill="#8BF5B1" r="3" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">Manulife</span>
                    <span className="text-outline-variant font-light text-body-sm">|</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Bayanihan</span>
                  </div>
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                    Philippines Employee &amp; Community Platform
                  </p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface tracking-tight">
                  Welcome to Bayanihan
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
                  Single Sign-On for Manulife Philippines employees, CSR event champions, and People &amp; Culture
                  administrators.
                </p>
              </div>

              <div className="w-full max-w-md pt-3">
                <button
                  className="w-full group bg-primary hover:bg-surface-tint text-on-primary py-3.5 px-6 rounded-lg font-label-lg text-label-lg flex items-center justify-center space-x-3 transition duration-200 shadow-md"
                  onClick={handleSsoClick}
                >
                  <div className="w-6 h-6 rounded bg-on-primary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-on-primary">verified_user</span>
                  </div>
                  <span className="font-semibold tracking-wide">Sign in with Manulife SSO</span>
                  <span className="material-symbols-outlined text-[20px] text-on-primary/80 group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <div className="mt-2.5 flex items-center justify-center space-x-3 text-tertiary">
                  <span className="flex items-center text-label-sm font-label-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary mr-1">lock</span>
                    Corporate Okta &amp; Microsoft Entra ID
                  </span>
                  <span className="text-outline-variant text-[10px]">•</span>
                  <span className="text-label-sm font-label-sm">BGC HQ Domain Active</span>
                </div>
              </div>
            </div>

            <div className="relative my-10">
              <div className="w-full h-px bg-surface-container" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-surface-container-lowest px-4 font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                  Or preview by role access (Development &amp; Demo Gateway)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {roleCards.map((card) => (
                <div
                  key={card.role}
                  className="group relative flex flex-col justify-between bg-surface-container-low hover:bg-surface-container-lowest rounded-xl p-6 transition duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconWrapClass}`}>
                        <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">{card.title}</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4">
                    <button
                      className="w-full bg-surface-container-lowest group-hover:bg-primary text-primary group-hover:text-on-primary py-2.5 px-4 rounded-lg font-label-md text-label-md transition duration-200 flex items-center justify-center space-x-2 shadow-sm"
                      onClick={() => handleRoleSelect(card.role)}
                    >
                      <span>{card.cta}</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {status && (
              <div className="mt-6 bg-secondary-container/50 text-on-secondary-container p-3 rounded-lg flex items-center justify-between transition-all">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
                  <span className="font-label-md text-label-md">{status}</span>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 bg-surface-container-low rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 text-center sm:text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Protected by Manulife Global Information Security</p>
                  <p className="font-body-sm text-body-sm text-tertiary">
                    Authorized corporate access only. Manila BGC HQ &amp; Regional Hubs.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-lowest text-primary shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-ping" />
                  SOC2 / ISO 27001
                </span>
              </div>
            </div>
          </div>

          <div className="w-full mt-6 py-2 flex flex-col sm:flex-row items-center justify-between text-tertiary font-label-sm text-label-sm px-2 gap-3">
            <span>© 2026 Manulife Philippines. Bayanihan Hub v3.4.</span>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">help_center</span>
                Help Desk
              </span>
              <span className="flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">support_agent</span>
                IT Support (Ext. 4880)
              </span>
              <span>Privacy Notice</span>
              <span>Terms of Use</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
