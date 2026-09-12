'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { PushNotifications, type PushNotificationSchema } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { simpanLanggananDorong } from '@/app/(app)/pemberitahuan/aksi-dorong'

const SALURAN = 'sipantau_penting'

function penandaPerangkat(): string {
  const kunci = 'sipantau_penanda_perangkat'
  const ada = localStorage.getItem(kunci)
  if (ada) return ada
  const baru = crypto.randomUUID()
  localStorage.setItem(kunci, baru)
  return baru
}

function ruteDariData(data?: Record<string, unknown>): string {
  const rute = typeof data?.rute === 'string' ? data.rute : ''
  return rute.startsWith('/') && !rute.startsWith('//') ? rute : '/pemberitahuan'
}

/**
 * Jembatan pemberitahuan native. Realtime Supabase tetap mengurus angka
 * lonceng ketika halaman hidup; FCM mengurus keadaan aplikasi berada di
 * latar belakang atau proses WebView sudah tidak berjalan.
 */
export function NotifikasiDorong() {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return
    let hidup = true
    const pembersih: Array<{ remove: () => Promise<void> }> = []

    async function pasang() {
      await PushNotifications.createChannel({
        id: SALURAN,
        name: 'Pemberitahuan penting',
        description: 'Penugasan, laporan, dan keadaan tugas yang memerlukan perhatian.',
        importance: 5,
        visibility: 1,
        vibration: true,
        sound: 'default',
      })
      await LocalNotifications.createChannel({
        id: SALURAN,
        name: 'Pemberitahuan penting',
        description: 'Penugasan, laporan, dan keadaan tugas yang memerlukan perhatian.',
        importance: 5,
        visibility: 1,
        vibration: true,
        sound: 'default',
      })

      const izin = await PushNotifications.checkPermissions()
      const akhir = izin.receive === 'prompt'
        ? await PushNotifications.requestPermissions()
        : izin
      if (akhir.receive !== 'granted') return

      pembersih.push(await PushNotifications.addListener('registration', token => {
        if (hidup) void simpanLanggananDorong({ token: token.value, penandaPerangkat: penandaPerangkat() })
      }))
      pembersih.push(await PushNotifications.addListener('registrationError', galat => {
        console.error('Pendaftaran FCM gagal', galat)
      }))
      pembersih.push(await PushNotifications.addListener('pushNotificationReceived', (n: PushNotificationSchema) => {
        if (!hidup) return
        void LocalNotifications.schedule({ notifications: [{
          id: (n.id || crypto.randomUUID()).split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) & 0x7fffffff,
          title: n.title || 'Pemberitahuan SiPANTAU',
          body: n.body || 'Ada pembaruan baru.',
          channelId: SALURAN,
          extra: n.data,
        }] })
      }))
      pembersih.push(await PushNotifications.addListener('pushNotificationActionPerformed', tindakan => {
        router.push(ruteDariData(tindakan.notification.data))
      }))
      pembersih.push(await LocalNotifications.addListener('localNotificationActionPerformed', tindakan => {
        router.push(ruteDariData(tindakan.notification.extra))
      }))
      await PushNotifications.register()
    }

    void pasang().catch(galat => console.error('Pemberitahuan native tidak dapat disiapkan', galat))
    return () => {
      hidup = false
      pembersih.forEach(p => { void p.remove() })
    }
  }, [router])

  return null
}
