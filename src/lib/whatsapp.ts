import { WHATSAPP_NUMBER } from "./siteConfig";

/**
 * Build a WhatsApp click-to-chat deep link with a pre-filled message.
 * Defaults to the Roam Saathi business WhatsApp number.
 *
 * @param message - the pre-filled text the customer/owner will see
 * @param phone   - digits only, no '+' (defaults to WHATSAPP_NUMBER)
 */
export function buildWhatsAppUrl(
  message: string,
  phone: string = WHATSAPP_NUMBER,
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Build a tel: link from a display phone string. */
export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Build a mailto: link with a prefilled subject. */
export function buildMailtoUrl(email: string, subject?: string): string {
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}
