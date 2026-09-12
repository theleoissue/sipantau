// Pengantar FCM untuk baris notifikasi yang ditandai mendesak.
// Dipanggil Database Webhook INSERT public.notifikasi. Kunci layanan
// Firebase hanya berada pada rahasia Edge Function, tidak pernah di APK.

import { GoogleAuth } from 'npm:google-auth-library@9.15.1'
import { klienService } from '../_shared/klien.ts'
import { jsonRespons } from '../_shared/respons.ts'

interface BarisNotifikasi {
  id: string
  penerima_id: string
  judul: string
  isi: string | null
  tujuan_jenis: string | null
  tujuan_id: string | null
  mendesak: boolean
}

function rute(n: BarisNotifikasi): string {
  if (!n.tujuan_id) return '/pemberitahuan'
  if (n.tujuan_jenis === 'penugasan') return `/penugasan/${n.tujuan_id}`
  if (n.tujuan_jenis === 'laporan') return `/laporan/${n.tujuan_id}`
  if (n.tujuan_jenis === 'lhp') return `/lhp/${n.tujuan_id}`
  if (n.tujuan_jenis === 'pengajuan_sprin') return '/penugasan/pengajuan'
  return '/pemberitahuan'
}

Deno.serve(async req => {
  if (req.method !== 'POST') return jsonRespons({ galat: 'METODE_TIDAK_DIIZINKAN' }, 405)
  const rahasia = Deno.env.get('PUSH_WEBHOOK_SECRET')
  if (!rahasia || req.headers.get('x-sipantau-webhook-secret') !== rahasia) {
    return jsonRespons({ galat: 'TIDAK_BERWENANG' }, 401)
  }

  const badan = await req.json().catch(() => null) as { type?: string; record?: BarisNotifikasi } | null
  const n = badan?.record
  if (badan?.type !== 'INSERT' || !n?.id) return jsonRespons({ galat: 'BENTUK_TIDAK_SAH' }, 400)
  if (!n.mendesak) return jsonRespons({ berhasil: true, dilewati: 'tidak_mendesak' })

  const svc = klienService()
  const { data: perangkat, error } = await svc.from('langganan_dorong')
    .select('id,penanda_dorong')
    .eq('pengguna_id', n.penerima_id)
    .eq('aktif', true)
  if (error) return jsonRespons({ galat: 'GAGAL_MEMBACA_PERANGKAT' }, 500)
  if (!perangkat?.length) return jsonRespons({ berhasil: true, dikirim: 0 })

  const akun = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON') || '{}')
  if (!akun.project_id || !akun.client_email || !akun.private_key) {
    return jsonRespons({ galat: 'FIREBASE_BELUM_DISETEL' }, 503)
  }
  const auth = new GoogleAuth({
    credentials: akun,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })
  const klien = await auth.getClient()
  const akses = await klien.getAccessToken()
  const tokenAkses = typeof akses === 'string' ? akses : akses.token
  if (!tokenAkses) return jsonRespons({ galat: 'TOKEN_FIREBASE_GAGAL' }, 503)

  let dikirim = 0
  for (const p of perangkat) {
    const respons = await fetch(`https://fcm.googleapis.com/v1/projects/${akun.project_id}/messages:send`, {
      method: 'POST',
      headers: { authorization: `Bearer ${tokenAkses}`, 'content-type': 'application/json' },
      body: JSON.stringify({ message: {
        token: p.penanda_dorong,
        notification: { title: n.judul, body: n.isi || 'Ada pembaruan baru.' },
        data: { notifikasi_id: n.id, rute: rute(n) },
        android: {
          priority: 'high',
          notification: { channel_id: 'sipantau_penting', sound: 'default' },
        },
      } }),
    })
    if (respons.ok) {
      dikirim += 1
      continue
    }
    const isi = await respons.text()
    if (respons.status === 404 || isi.includes('UNREGISTERED')) {
      await svc.from('langganan_dorong').update({ aktif: false, diubah_pada: new Date().toISOString() }).eq('id', p.id)
    } else {
      console.error('FCM menolak kiriman', respons.status, isi)
    }
  }
  return jsonRespons({ berhasil: true, dikirim })
})
