// Fase 6: synchronisatie met Supabase, local-first.
//
// localStorage blijft de waarheid voor de schermen (snel, offline); deze
// laag duwt wijzigingen met een korte vertraging naar Supabase en haalt bij
// het openen/terugkeren van de app de cloud-stand binnen. Zonder
// VITE_SUPABASE_URL/-ANON_KEY doet de app het gewoon lokaal, zonder sync.

import { createClient } from '@supabase/supabase-js'
import { registreerSyncListener, vervangTabel, leesTabel } from './storage.js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const syncBeschikbaar = Boolean(url && anonKey)
const client = syncBeschikbaar ? createClient(url, anonKey) : null

// Gerechten syncen niet: die komen uit de seed (plan/doel1-plan.json).
// seed_versie blijft lokaal, anders zou een oud apparaat een reseed forceren.
const TABELLEN = ['weekmenu', 'boodschappen', 'sessies', 'metingen', 'droge_dagen', 'doelen', 'instellingen']

const dirty = new Set()
let pushTimer = null

function meldSync() {
  globalThis.dispatchEvent(new Event('doel1:sync'))
}

export function initSync() {
  if (!client) return
  registreerSyncListener((tabel) => {
    if (!TABELLEN.includes(tabel)) return
    dirty.add(tabel)
    clearTimeout(pushTimer)
    pushTimer = setTimeout(push, 2000)
  })
  client.auth.onAuthStateChange((gebeurtenis) => {
    if (gebeurtenis === 'SIGNED_IN') pull()
  })
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) synchroniseer()
  })
  synchroniseer()
}

export async function huidigeGebruiker() {
  if (!client) return null
  const { data } = await client.auth.getSession()
  return data.session ? data.session.user : null
}

export async function inloggen(email, wachtwoord) {
  const { error } = await client.auth.signInWithPassword({ email, password: wachtwoord })
  return error ? error.message : null
}

export async function registreren(email, wachtwoord) {
  const { error } = await client.auth.signUp({ email, password: wachtwoord })
  return error ? error.message : null
}

export async function uitloggen() {
  await client.auth.signOut()
  meldSync()
}

// Eerst lokale wijzigingen wegschrijven, dan de cloud-stand ophalen.
export async function synchroniseer() {
  await push()
  await pull()
}

// Dirty tabellen als geheel vervangen in de cloud: klein datavolume,
// en verwijderingen gaan zo vanzelf goed.
export async function push() {
  const gebruiker = await huidigeGebruiker()
  if (!gebruiker) return
  for (const tabel of [...dirty]) {
    await pushTabel(tabel, gebruiker.id)
    dirty.delete(tabel)
  }
  meldSync()
}

async function pushTabel(tabel, userId) {
  let rijen
  if (tabel === 'instellingen') {
    const { seed_versie, ...data } = leesTabel('instellingen')
    rijen = [{ user_id: userId, data }]
  } else {
    rijen = leesTabel(tabel).map((r) => ({ ...r, user_id: userId }))
  }
  await client.from(tabel).delete().eq('user_id', userId)
  if (rijen.length > 0) await client.from(tabel).insert(rijen)
}

// Cloud → lokaal. Alleen als er geen onverzonden lokale wijzigingen zijn.
// Geeft terug of de cloud data bevatte (voor de importeer-hint).
export async function pull() {
  const gebruiker = await huidigeGebruiker()
  if (!gebruiker || dirty.size > 0) return null
  let cloudHeeftData = false
  for (const tabel of TABELLEN) {
    const { data, error } = await client.from(tabel).select('*')
    if (error) continue
    if (tabel === 'instellingen') {
      if (data.length > 0) {
        cloudHeeftData = true
        const lokaal = leesTabel('instellingen')
        vervangTabel('instellingen', { ...lokaal, ...data[0].data, seed_versie: lokaal.seed_versie })
      }
    } else if (data.length > 0) {
      cloudHeeftData = true
      vervangTabel(tabel, data.map(({ user_id, ...rij }) => rij))
    }
  }
  meldSync()
  return cloudHeeftData
}

// De eenmalige "importeer lokale data"-knop: alles wat lokaal staat naar de
// cloud schrijven (overschrijft de cloud-stand).
export async function importeerLokaleData() {
  const gebruiker = await huidigeGebruiker()
  if (!gebruiker) return
  for (const tabel of TABELLEN) {
    await pushTabel(tabel, gebruiker.id)
  }
  dirty.clear()
  meldSync()
}
