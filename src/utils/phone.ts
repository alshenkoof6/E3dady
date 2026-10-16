/**
 * Converts Eastern Arabic / Indic numerals (٠-٩) and Persian numerals to Western digits (0-9)
 */
export function convertArabicToEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9');
}

/**
 * Formats any phone number into a valid international WhatsApp number.
 * Specially optimized for Egyptian mobile operators (010, 011, 012, 015)
 * and international formats (+20, 0020, etc.).
 */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  
  // 1. Convert Arabic numerals to standard 0-9
  let cleaned = convertArabicToEnglishDigits(phone.trim());
  
  // 2. Remove all non-digit characters (spaces, +, -, (), etc.)
  cleaned = cleaned.replace(/[^0-9]/g, '');
  if (!cleaned) return '';

  // 3. Remove international exit code (0020... -> 20...)
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.slice(2);
  }

  // 4. Handle standard Egyptian mobile: 010..., 011..., 012..., 015... (11 digits starting with 01)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '2' + cleaned; // '2' + '01xxxxxxxx' = '201xxxxxxxx' (12 digits)
  }

  // 5. Handle Egyptian mobile without leading 0: 10..., 11..., 12..., 15... (10 digits)
  if (['10', '11', '12', '15'].some((prefix) => cleaned.startsWith(prefix)) && cleaned.length === 10) {
    return '20' + cleaned; // '20' + '1xxxxxxxxx' = '201xxxxxxxx' (12 digits)
  }

  // 6. Already in 201xxxxxxxxx (12 digits)
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return cleaned;
  }

  // 7. If entered with 2001... (previously erroneously prepended 20 to 01...)
  if (cleaned.startsWith('2001') && cleaned.length === 13) {
    return '20' + cleaned.slice(3); // 201xxxxxxxxx
  }

  // 8. If started with single 0 (other formats)
  if (cleaned.startsWith('0') && cleaned.length > 8) {
    return '20' + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Formats phone for tel: links (e.g. tel:01234567890)
 */
export function formatTelPhone(phone?: string): string {
  if (!phone) return '';
  let cleaned = convertArabicToEnglishDigits(phone.trim());
  return cleaned.replace(/[^0-9+]/g, '');
}

/**
 * Generates a valid wa.me URL with properly formatted phone number and message
 */
export function getWhatsAppUrl(phone?: string, text?: string): string {
  const formattedPhone = formatWhatsAppPhone(phone);
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : '';
  if (!formattedPhone) {
    return text ? `https://wa.me/${encodedText}` : '';
  }
  return `https://wa.me/${formattedPhone}${encodedText}`;
}
