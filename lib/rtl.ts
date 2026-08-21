const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export function isArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

export function dirFor(text: string): "rtl" | "ltr" {
  return isArabic(text) ? "rtl" : "ltr";
}