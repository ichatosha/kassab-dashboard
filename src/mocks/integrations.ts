import type {
  ApiCredential, CompanyIntegration, IntegrationProviderInfo,
  IntegrationSyncLog,
} from '../types/domain'
import { companyIdFor } from './companies'

const minsAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

// What a company can connect. Kassab Tracking is deliberately in the same
// list: a company with no system of its own picks it and runs its
// deliveries on Kassab instead of connecting one.
export const integrationProviders: IntegrationProviderInfo[] = [
  {
    id: 'kassab-native', name: 'Kassab Delivery Tracking', nameAr: 'تتبع كساب للتوصيل',
    kind: 'kassab', methods: ['native'], descriptionKey: 'prov.kassab',
  },
  {
    id: 'foodics', name: 'Foodics POS', nameAr: 'فودكس',
    kind: 'pos', methods: ['rest', 'webhook'], descriptionKey: 'prov.pos',
  },
  {
    id: 'odoo', name: 'Odoo ERP', nameAr: 'أودو',
    kind: 'erp', methods: ['rest', 'oauth'], descriptionKey: 'prov.erp',
  },
  {
    id: 'woocommerce', name: 'WooCommerce', nameAr: 'ووكومرس',
    kind: 'ecommerce', methods: ['rest', 'webhook'], descriptionKey: 'prov.ecommerce',
  },
  {
    id: 'shopify', name: 'Shopify', nameAr: 'شوبيفاي',
    kind: 'ecommerce', methods: ['oauth', 'webhook'], descriptionKey: 'prov.ecommerce',
  },
  {
    id: 'pharmacy-suite', name: 'Pharmacy Suite', nameAr: 'نظام الصيدليات',
    kind: 'pos', methods: ['rest'], descriptionKey: 'prov.pharmacy',
  },
  {
    id: 'custom-api', name: 'Custom API', nameAr: 'واجهة مخصصة',
    kind: 'custom', methods: ['rest', 'webhook', 'manual'], descriptionKey: 'prov.custom',
  },
]

export const providerById = (id: string) => integrationProviders.find((p) => p.id === id)

export const mockIntegrations: CompanyIntegration[] = [
  {
    id: 'int-koshary', companyId: companyIdFor('koshary'), providerId: 'foodics',
    method: 'rest', status: 'connected', environment: 'production',
    baseUrl: 'https://api.foodics.example/v5', maskedKey: 'fd_live_••••••4821',
    webhookUrl: 'https://hooks.kassab.eg/v1/koshary/orders',
    connectedAt: daysAgo(46), lastSyncAt: minsAgo(2), ordersToday: 184,
  },
  {
    id: 'int-sehha', companyId: companyIdFor('sehha'), providerId: 'pharmacy-suite',
    method: 'rest', status: 'connected', environment: 'production',
    baseUrl: 'https://sehha-suite.example/api', maskedKey: 'ph_live_••••••9075',
    connectedAt: daysAgo(31), lastSyncAt: minsAgo(6), ordersToday: 96,
  },
  {
    id: 'int-techzone', companyId: companyIdFor('techzone'), providerId: 'woocommerce',
    method: 'webhook', status: 'error', environment: 'production',
    baseUrl: 'https://techzone.example/wp-json/wc/v3',
    webhookUrl: 'https://hooks.kassab.eg/v1/techzone/orders',
    connectedAt: daysAgo(22), lastSyncAt: minsAgo(154), ordersToday: 12,
    errorMessageKey: 'int.errWebhook',
  },
  // No system of their own — they run on Kassab's own tracking
  {
    id: 'int-fresh', companyId: companyIdFor('fresh'), providerId: 'kassab-native',
    method: 'native', status: 'connected', environment: 'production',
    connectedAt: daysAgo(12), lastSyncAt: minsAgo(1), ordersToday: 38,
  },
  {
    id: 'int-shawerma', companyId: companyIdFor('shawerma'), providerId: 'kassab-native',
    method: 'native', status: 'connected', environment: 'production',
    connectedAt: daysAgo(5), lastSyncAt: minsAgo(3), ordersToday: 21,
  },
  {
    id: 'int-misr', companyId: companyIdFor('misr'), providerId: 'odoo',
    method: 'oauth', status: 'syncing', environment: 'sandbox',
    baseUrl: 'https://misr-logistics.example/odoo', maskedKey: 'oauth_••••••3390',
    connectedAt: daysAgo(3), lastSyncAt: minsAgo(0), ordersToday: 47,
  },
]

export const mockSyncLogs: IntegrationSyncLog[] = [
  { id: 'log-01', integrationId: 'int-koshary', at: minsAgo(2), kind: 'sync', ok: true, ordersReceived: 12, message: 'Sync completed — 12 orders received', messageAr: 'اكتملت المزامنة — استُلم ١٢ طلبًا' },
  { id: 'log-02', integrationId: 'int-koshary', at: minsAgo(17), kind: 'webhook', ok: true, message: 'Webhook received: order.delivered', messageAr: 'تم استلام حدث: تم التسليم' },
  { id: 'log-03', integrationId: 'int-koshary', at: minsAgo(32), kind: 'sync', ok: true, ordersReceived: 9, message: 'Sync completed — 9 orders received', messageAr: 'اكتملت المزامنة — استُلم ٩ طلبات' },
  { id: 'log-04', integrationId: 'int-techzone', at: minsAgo(154), kind: 'error', ok: false, message: 'Webhook endpoint returned 401 — token rejected', messageAr: 'رفض الخادم الحدث (401) — الرمز غير صالح' },
  { id: 'log-05', integrationId: 'int-techzone', at: minsAgo(160), kind: 'webhook', ok: true, message: 'Webhook received: order.created', messageAr: 'تم استلام حدث: طلب جديد' },
  { id: 'log-06', integrationId: 'int-sehha', at: minsAgo(6), kind: 'sync', ok: true, ordersReceived: 7, message: 'Sync completed — 7 orders received', messageAr: 'اكتملت المزامنة — استُلم ٧ طلبات' },
  { id: 'log-07', integrationId: 'int-sehha', at: minsAgo(66), kind: 'test', ok: true, message: 'Connection test passed', messageAr: 'نجح اختبار الاتصال' },
  { id: 'log-08', integrationId: 'int-misr', at: minsAgo(0), kind: 'sync', ok: true, ordersReceived: 5, message: 'Sync in progress', messageAr: 'جارٍ المزامنة' },
  { id: 'log-09', integrationId: 'int-fresh', at: minsAgo(1), kind: 'sync', ok: true, ordersReceived: 3, message: 'Order created in Kassab', messageAr: 'تم إنشاء طلب داخل كساب' },
  { id: 'log-10', integrationId: 'int-fresh', at: daysAgo(12), kind: 'connect', ok: true, message: 'Kassab tracking enabled', messageAr: 'تم تفعيل تتبع كساب' },
  { id: 'log-11', integrationId: 'int-shawerma', at: minsAgo(3), kind: 'sync', ok: true, ordersReceived: 2, message: 'Order created in Kassab', messageAr: 'تم إنشاء طلب داخل كساب' },
]

// A company connecting its own system already holds a Kassab key; one on
// Kassab tracking has no system to call in with, so it has none.
export const mockApiCredentials: ApiCredential[] = mockIntegrations
  .filter((i) => i.method !== 'native' && i.status !== 'disconnected')
  .map((i, index) => ({
    companyId: i.companyId,
    token: `ksb_live_${'0123456789abcdef'.repeat(2)}${1000 + index}`,
    createdAt: i.connectedAt ?? daysAgo(30),
    lastUsedAt: minsAgo(2 + index * 5),
    createdBy: 'Kassab Admin',
  }))
