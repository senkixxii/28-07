export * from './database'
export * from './models'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}
