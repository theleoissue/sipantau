import { NextRequest, NextResponse } from 'next/server'
import { klienServer } from '@/lib/supabase/server'

const URL_AUTOCOMPLETE = 'https://places.googleapis.com/v1/places:autocomplete'
const URL_TEXT_SEARCH = 'https://places.googleapis.com/v1/places:searchText'
const URL_REVERSE_GEOCODE = 'https://maps.googleapis.com/maps/api/geocode/json'
const BATAS_JAWA_BARAT = {
  rectangle: {
    low: { latitude: -7.85, longitude: 106.35 },
    high: { latitude: -5.85, longitude: 108.95 },
  },
}

interface PermintaanTempat {
  aksi?: 'autocomplete' | 'detail' | 'cari' | 'balik'
  kueri?: string
  placeId?: string
  sessionToken?: string
  lat?: number
  lng?: number
}

function respons(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function google(url: string, key: string, init: RequestInit, fieldMask?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': key,
  }
  if (fieldMask) headers['X-Goog-FieldMask'] = fieldMask
  return fetch(url, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(10_000) })
}

/**
 * Proksi sempit Places API (New). Kunci Google tetap berada di server;
 * klien tidak dapat memilih URL, field mask, atau API Google lain.
 */
export async function POST(req: NextRequest) {
  const supabase = await klienServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return respons({ galat: 'Sesi Anda sudah berakhir. Masuk kembali.' }, 401)

  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY
  if (!key) return respons({ galat: 'Pencarian Google belum dikonfigurasi di server.', kode: 'GOOGLE_BELUM_SIAP' }, 503)

  let badan: PermintaanTempat
  try { badan = await req.json() as PermintaanTempat }
  catch { return respons({ galat: 'Permintaan pencarian tidak sah.' }, 400) }

  try {
    if (badan.aksi === 'balik') {
      const lat = Number(badan.lat)
      const lng = Number(badan.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return respons({ galat: 'Koordinat tidak sah.' }, 400)
      }
      const r = await fetch(`${URL_REVERSE_GEOCODE}?${new URLSearchParams({ latlng: `${lat},${lng}`, key })}`, {
        cache: 'no-store', signal: AbortSignal.timeout(10_000),
      })
      const data = await r.json()
      if (!r.ok || data.status !== 'OK') throw new Error(`Google Reverse Geocoding ${r.status}: ${data.status ?? 'gagal'}`)
      return respons({ alamat: data.results?.[0]?.formatted_address ?? '' , penyedia: 'google' })
    }

    if (badan.aksi === 'autocomplete') {
      const kueri = badan.kueri?.trim().slice(0, 160) ?? ''
      if (kueri.length < 3) return respons({ hasil: [] })
      const r = await google(URL_AUTOCOMPLETE, key, {
        method: 'POST',
        body: JSON.stringify({
          input: kueri,
          sessionToken: badan.sessionToken?.slice(0, 36),
          includedRegionCodes: ['id'],
          languageCode: 'id',
          regionCode: 'ID',
          locationBias: BATAS_JAWA_BARAT,
          includePureServiceAreaBusinesses: true,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(`Google Autocomplete ${r.status}: ${JSON.stringify(data).slice(0, 500)}`)
      const hasil = (data.suggestions ?? []).flatMap((s: {
        placePrediction?: { placeId?: string; text?: { text?: string }; structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } } }
      }) => {
        const p = s.placePrediction
        if (!p?.placeId) return []
        return [{
          id: p.placeId,
          nama: p.structuredFormat?.mainText?.text ?? p.text?.text ?? 'Lokasi',
          alamat: p.structuredFormat?.secondaryText?.text ?? '',
          sumber: 'google_places',
        }]
      })
      return respons({ hasil, penyedia: 'google' })
    }

    if (badan.aksi === 'detail') {
      const placeId = badan.placeId?.trim() ?? ''
      if (!/^[A-Za-z0-9_-]{8,300}$/.test(placeId)) return respons({ galat: 'Identitas tempat tidak sah.' }, 400)
      const params = new URLSearchParams({ languageCode: 'id', regionCode: 'ID' })
      if (badan.sessionToken) params.set('sessionToken', badan.sessionToken.slice(0, 36))
      const r = await google(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params}`,
        key,
        { method: 'GET' },
        'id,displayName,formattedAddress,location,types',
      )
      const p = await r.json()
      if (!r.ok) throw new Error(`Google Place Details ${r.status}: ${JSON.stringify(p).slice(0, 500)}`)
      return respons({ hasil: {
        id: p.id,
        nama: p.displayName?.text ?? 'Lokasi',
        alamat: p.formattedAddress ?? '',
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        jenis: Array.isArray(p.types) ? p.types : [],
        sumber: 'google_places',
      }, penyedia: 'google' })
    }

    if (badan.aksi === 'cari') {
      const kueri = badan.kueri?.trim().slice(0, 160) ?? ''
      if (kueri.length < 2) return respons({ hasil: [] })
      const r = await google(URL_TEXT_SEARCH, key, {
        method: 'POST',
        body: JSON.stringify({
          textQuery: kueri,
          maxResultCount: 5,
          languageCode: 'id',
          regionCode: 'ID',
          locationBias: BATAS_JAWA_BARAT,
        }),
      }, 'places.id,places.displayName,places.formattedAddress,places.location,places.types')
      const data = await r.json()
      if (!r.ok) throw new Error(`Google Text Search ${r.status}: ${JSON.stringify(data).slice(0, 500)}`)
      return respons({ hasil: (data.places ?? []).map((p: {
        id: string; displayName?: { text?: string }; formattedAddress?: string
        location?: { latitude?: number; longitude?: number }; types?: string[]
      }) => ({
        id: p.id,
        nama: p.displayName?.text ?? 'Lokasi',
        alamat: p.formattedAddress ?? '',
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        jenis: p.types ?? [],
        sumber: 'google_places',
      })), penyedia: 'google' })
    }

    return respons({ galat: 'Jenis pencarian tidak dikenal.' }, 400)
  } catch (error) {
    console.error('Pencarian Google Places gagal', error)
    return respons({ galat: 'Pencarian Google sedang tidak tersedia. Gunakan pencarian cadangan.' }, 502)
  }
}
