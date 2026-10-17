/** Small, deterministic text utilities. No outbound requests or dynamic code execution. */
export function validateEmail(value) {
  if (typeof value !== 'string' || value.length > 254) return { valid: false, reason: 'invalid_length' };
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return { valid: false, reason: 'invalid_format' };
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const labels = domain.split('.');
  const ok = local.length <= 64 && !/\s/.test(local) && !/[<>()[\]\\,;:\"]/.test(local)
    && labels.length >= 2 && labels.every(label => label.length > 0 && label.length <= 63
      && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label))
    && /^[a-zA-Z]{2,63}$/.test(labels[labels.length - 1]);
  return { valid: ok, reason: ok ? 'valid_syntax' : 'invalid_format' };
}
export function validateUrl(value) {
  try { const url = new URL(value); const valid = ['http:', 'https:'].includes(url.protocol) && !!url.hostname;
    return { valid, reason: valid ? 'valid_http_url' : 'non_http_scheme' };
  } catch { return { valid: false, reason: 'invalid_url' }; }
}
export function validatePhoneE164(value) {
  const valid = /^\+[1-9]\d{1,14}$/.test(value);
  return { valid, reason: valid ? 'valid_e164_syntax' : 'invalid_e164_syntax' };
}
export function validateUuid(value) {
  const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  return { valid, reason: valid ? 'valid_uuid_syntax' : 'invalid_uuid_syntax' };
}
export function validateIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { valid: false, reason: 'invalid_iso_date' };
  const [y, m, d] = value.split('-').map(Number);
  if (y < 1 || m < 1 || m > 12 || d < 1) return { valid: false, reason: 'invalid_iso_date' };
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31];
  const valid = d <= days[m - 1];
  return { valid, reason: valid ? 'valid_iso_date' : 'invalid_iso_date' };
}
export function validateIban(raw) {
  const iban = raw.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) || iban.length > 34) return { valid: false, reason: 'invalid_iban_format' };
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const digits = char >= 'A' && char <= 'Z' ? String(char.charCodeAt(0) - 55) : char;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  const valid = remainder === 1;
  return { valid, reason: valid ? 'valid_iban_checksum' : 'invalid_iban_checksum' };
}
export function validateJson(value) {
  try { JSON.parse(value); return { valid: true, reason: 'valid_json' }; }
  catch { return { valid: false, reason: 'invalid_json' }; }
}
export function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160).replace(/-+$/g, '');
}
export function stripAnsi(value) {
  return value.replace(/\x1B\][^\x07\x1B]{0,1024}(?:\x07|\x1B\\)/g, '')
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}
export function normalizeWhitespace(value) { return value.trim().replace(/\s+/gu, ' '); }
