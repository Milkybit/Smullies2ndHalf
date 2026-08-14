import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bmi, gezondGewicht, gezondVetPercentage, gezondeVetmassa,
  gewichtBijVetPercentage,
} from '../src/logic/referentie.js'

test('BMI en gezonde gewichtsband bij 180 cm', () => {
  assert.ok(Math.abs(bmi(84, 180) - 25.9) < 0.05)
  const band = gezondGewicht(180)
  assert.ok(Math.abs(band.min - 59.9) < 0.1)
  assert.ok(Math.abs(band.max - 80.7) < 0.1)
  assert.equal(gezondGewicht(null), null)
})

test('gezond vetpercentage loopt op met de leeftijd', () => {
  assert.deepEqual(gezondVetPercentage(30, 'man'), { min: 8, max: 19 })
  assert.deepEqual(gezondVetPercentage(40, 'man'), { min: 11, max: 22 })
  assert.deepEqual(gezondVetPercentage(65, 'man'), { min: 13, max: 25 })
  assert.deepEqual(gezondVetPercentage(40, 'vrouw'), { min: 23, max: 34 })
  // onbekend geslacht valt terug op de mannenband
  assert.deepEqual(gezondVetPercentage(40, 'onbekend'), { min: 11, max: 22 })
})

test('gezonde vetmassa in kg bij het huidige gewicht', () => {
  const band = gezondeVetmassa(84, 40)
  assert.ok(Math.abs(band.min - 9.24) < 0.01)
  assert.ok(Math.abs(band.max - 18.48) < 0.01)
})

test('streefgewicht bij gelijkblijvende vetvrije massa', () => {
  // 64 kg vetvrij: op 20% vet weeg je 80 kg, op 15% vet 75,3 kg
  assert.ok(Math.abs(gewichtBijVetPercentage(64, 20) - 80) < 0.01)
  assert.ok(Math.abs(gewichtBijVetPercentage(64, 15) - 75.29) < 0.01)
  assert.equal(gewichtBijVetPercentage(64, null), null)
  assert.equal(gewichtBijVetPercentage(null, 20), null)
})
