import { WirdApi } from './index'

declare global {
  interface Window {
    wirdApi: WirdApi
  }
}

