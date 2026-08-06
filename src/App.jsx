import React, { useState } from 'react'
import Vandaag from './screens/Vandaag.jsx'
import Week from './screens/Week.jsx'
import Eten from './screens/Eten.jsx'
import Voortgang from './screens/Voortgang.jsx'

const TABS = [
  { id: 'vandaag', label: 'Vandaag', Scherm: Vandaag, icoon: IcoonVlam },
  { id: 'week', label: 'Week', Scherm: Week, icoon: IcoonWeek },
  { id: 'eten', label: 'Eten', Scherm: Eten, icoon: IcoonEten },
  { id: 'voortgang', label: 'Voortgang', Scherm: Voortgang, icoon: IcoonTrend },
]

// #week, #eten of #voortgang in de URL opent die tab direct — handig voor
// een snelkoppeling of Shortcut (bijv. de boodschappenlijst bij de winkel).
function tabUitHash() {
  const hash = window.location.hash.replace('#', '')
  return TABS.some((t) => t.id === hash) ? hash : 'vandaag'
}

export default function App() {
  const [actief, setActiefState] = useState(tabUitHash)
  const setActief = (id) => {
    window.location.hash = id
    setActiefState(id)
  }
  const { Scherm } = TABS.find((t) => t.id === actief)
  return (
    <>
      <main className="scherm">
        <Scherm />
      </main>
      <nav className="tabbalk">
        <div className="tabbalk-binnen">
          {TABS.map(({ id, label, icoon: Icoon }) => (
            <button
              key={id}
              className={'tab' + (id === actief ? ' actief' : '')}
              onClick={() => setActief(id)}
            >
              <Icoon />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}

function IcoonVlam() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1 3-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 1 3 4a7 7 0 0 1-14 0C4 8 10 7 12 3z" />
    </svg>
  )
}

function IcoonWeek() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function IcoonEten() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 3v18M17 3c-2 0-3 3-3 6s1 3 3 3v9" />
    </svg>
  )
}

function IcoonTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18M4 16l5-5 4 3 7-8" />
    </svg>
  )
}
