export function whatsappUrl(phone: string, message = ""): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const url = new URL(`https://wa.me/${digits}`);
  if (message.trim()) {
    url.searchParams.set("text", message.trim());
  }
  return url.toString();
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}
