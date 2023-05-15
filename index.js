#!/usr/bin/env node

import { RelayPool } from 'nostr'
import fs from 'fs'
import path from 'path'
import process from 'process'
import eventld from 'event-ld' // Assuming eventld is in the same directory

// Get events from command line arguments
const events = process.argv.slice(2)
if (events.length === 0) {
  events.push('1555d356baf4ca4773ff1ce6c1a2da75d16087b2329a981b30268e3507c76f91')
}

const root = './.well-known/nostr/event'

events.forEach(event => {
  const cacheDirectory = path.join(root, `${event}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  fs.mkdirSync(cacheDirectory, { recursive: true })
})

const scsi = 'wss://relay.damus.io/'
const relay = [scsi]

const pool = new RelayPool(relay)
pool.on('open', relay => {
  // Subscribe for each event
  events.forEach(event => {
    relay.subscribe('subid' + event, { ids: [event] })
  })
})

pool.on('event', (relay, sub_id, ev) => {
  console.log('event', sub_id, ev)
  const event = sub_id.slice(5) // Remove 'subid' prefix to get the event
  const cacheDirectory = path.join(root, `${event}`)
  const filename = 'index.json'
  const cacheFilePath = path.join(cacheDirectory, filename)

  // Use eventld function here to convert the event to JSON-LD
  const out = eventld(ev)

  fs.writeFileSync(cacheFilePath, JSON.stringify(out, null, 2))

  relay.close()
})
