export interface messageType {
  conversationId: string,
  content: string,
  type?: string,
  replyTo: string,
  media?: any[]
}