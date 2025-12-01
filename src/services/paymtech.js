import fs from 'fs'
import https from 'https'
import axios from 'axios'

const {
  PAYMTECH_BASE_URL = 'https://sandboxapi.paymtech.kz',
  PAYMTECH_ORDER_CREATE_PATH = '/v1/orders',
  PAYMTECH_ORDER_STATUS_PATH = '/v1/orders/{orderId}',
  PAYMTECH_PROJECT = 'neuroboost',
  PAYMTECH_USERNAME,
  PAYMTECH_PASSWORD,
  PAYMTECH_P12_FILE = './certs/neuroboost.p12',
  PAYMTECH_P12_PASSPHRASE
} = process.env

// Create axios client with mTLS and optional Basic auth
const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(PAYMTECH_P12_FILE),
  passphrase: PAYMTECH_P12_PASSPHRASE,
  rejectUnauthorized: true
})

const client = axios.create({
  baseURL: PAYMTECH_BASE_URL,
  httpsAgent,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Project': PAYMTECH_PROJECT
  },
  auth: PAYMTECH_USERNAME && PAYMTECH_PASSWORD ? {
    username: PAYMTECH_USERNAME,
    password: PAYMTECH_PASSWORD
  } : undefined
})

export async function createOrder(payload) {
  // NOTE: Exact API path/fields may differ; adjust PAYMTECH_ORDER_CREATE_PATH per docs.
  const url = PAYMTECH_ORDER_CREATE_PATH
  const { data } = await client.post(url, payload)
  return data
}

export async function getOrderStatus(orderId) {
  const url = PAYMTECH_ORDER_STATUS_PATH.replace('{orderId}', encodeURIComponent(orderId))
  const { data } = await client.get(url)
  return data
}
