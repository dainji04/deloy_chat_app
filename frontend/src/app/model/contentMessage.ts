export interface contentMessage {
  media?: {
    publicId: string;
    url: string;
  }
  text: string;
  type: string;
}
