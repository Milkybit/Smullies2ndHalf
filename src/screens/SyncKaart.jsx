import React, { useEffect, useState } from 'react'
import {
  syncBeschikbaar, huidigeGebruiker,
  inloggen, registreren, uitloggen,
  synchroniseer, importeerLokaleData,
} from '../sync.js'

// Synchronisatie-kaart (fase 6): e-mail-login en de eenmalige importknop.
// Zonder geconfigureerde Supabase-omgeving toont hij alleen een hint.
export default function SyncKaart() {
  const [gebruiker, setGebruiker] = useState(null)
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [melding, setMelding] = useState(null)
  const [bezig, setBezig] = useState(false)

  async function ververs() {
    setGebruiker(await huidigeGebruiker())
  }

  useEffect(() => {
    if (!syncBeschikbaar) return
    ververs()
    globalThis.addEventListener('doel1:sync', ververs)
    return () => globalThis.removeEventListener('doel1:sync', ververs)
  }, [])

  if (!syncBeschikbaar) {
    return (
      <div className="kaart">
        <div className="kaart-titel">Synchronisatie</div>
        <p className="klein zacht" style={{ margin: 0 }}>
          Nog niet geconfigureerd — zet VITE_SUPABASE_URL en
          VITE_SUPABASE_ANON_KEY als secrets (zie README). Tot die tijd werkt
          alles gewoon lokaal.
        </p>
      </div>
    )
  }

  async function doe(actie, klaarMelding) {
    setBezig(true)
    setMelding(null)
    try {
      const fout = await actie()
      setMelding(fout || klaarMelding)
    } catch (e) {
      setMelding(String(e.message || e))
    } finally {
      setBezig(false)
      ververs()
    }
  }

  return (
    <div className="kaart">
      <div className="kaart-titel">Synchronisatie</div>
      {gebruiker ? (
        <>
          <p className="klein" style={{ marginTop: 0 }}>
            Ingelogd als <strong>{gebruiker.email}</strong> — wijzigingen
            synchroniseren automatisch.
          </p>
          <div className="knoppenrij">
            <button className="knop" disabled={bezig}
              onClick={() => doe(async () => { await synchroniseer() }, 'Gesynchroniseerd.')}>
              Nu synchroniseren
            </button>
            <button className="knop" disabled={bezig}
              onClick={() => doe(async () => { await uitloggen() }, 'Uitgelogd.')}>
              Uitloggen
            </button>
          </div>
          <button className="knop" style={{ width: '100%', marginTop: '0.5rem' }} disabled={bezig}
            onClick={() => doe(async () => { await importeerLokaleData() }, 'Lokale data naar de cloud geschreven.')}>
            Importeer lokale data → cloud (eenmalig)
          </button>
        </>
      ) : (
        <>
          <p className="klein zacht" style={{ marginTop: 0 }}>
            Log in om je data over apparaten te synchroniseren. Eerste keer?
            Registreer met een e-mail en wachtwoord, log daarna hier in en
            druk op "Importeer lokale data".
          </p>
          <div className="veldenrij">
            <div>
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="veldenrij">
            <div>
              <label>Wachtwoord</label>
              <input type="password" value={wachtwoord} onChange={(e) => setWachtwoord(e.target.value)} />
            </div>
          </div>
          <div className="knoppenrij">
            <button className="knop primair" disabled={bezig || !email || !wachtwoord}
              onClick={() => doe(() => inloggen(email, wachtwoord), 'Ingelogd.')}>
              Inloggen
            </button>
            <button className="knop" disabled={bezig || !email || !wachtwoord}
              onClick={() => doe(() => registreren(email, wachtwoord), 'Geregistreerd — je kunt nu inloggen.')}>
              Registreren
            </button>
          </div>
        </>
      )}
      {melding && <p className="klein zacht" style={{ margin: '0.5rem 0 0' }}>{melding}</p>}
    </div>
  )
}
