import type { CartItem } from '@/stores/cartStore';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface WhatsAppConfig {
  phoneNumber: string; // Store owner's WhatsApp number
  storeName: string;
}

/**
 * Generate a WhatsApp message for an order
 */
export const generateWhatsAppMessage = (
  formData: CheckoutFormData,
  items: CartItem[],
  total: number,
  config: WhatsAppConfig
): string => {
  const { fullName, phone, address, notes } = formData;

  // Build the message
  let message = `*طلب جديد من ${config.storeName}* 🛍️\n\n`;
  
  // Customer Info
  message += `*بيانات العميل:*\n`;
  message += `الاسم: ${fullName}\n`;
  message += `الهاتف: ${phone}\n`;
  message += `العنوان: ${address}\n`;
  if (notes) {
    message += `ملاحظات: ${notes}\n`;
  }
  message += `\n`;

  // Order Items
  message += `*المنتجات:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   الكمية: ${item.quantity} × ${item.price} ر.س\n`;
    message += `   المجموع: ${item.quantity * item.price} ر.س\n`;
  });
  message += `\n`;

  // Total
  message += `*المجموع الكلي: ${total} ر.س*\n\n`;

  // Payment Method
  message += `*طريقة الدفع:* دفع نقدي عند الاستلام 💵\n\n`;

  // Footer
  message += `---\n`;
  message += `شكراً لثقتكم بنا! 🙏`;

  return message;
};

/**
 * Generate WhatsApp link
 */
export const generateWhatsAppLink = (
  formData: CheckoutFormData,
  items: CartItem[],
  total: number,
  config: WhatsAppConfig
): string => {
  const message = generateWhatsAppMessage(formData, items, total, config);
  const encodedMessage = encodeURIComponent(message);
  
  // Remove any non-numeric characters from phone number
  const cleanPhone = config.phoneNumber.replace(/[^\d]/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp with the order message
 */
export const openWhatsAppOrder = (
  formData: CheckoutFormData,
  items: CartItem[],
  total: number,
  config: WhatsAppConfig
): void => {
  const link = generateWhatsAppLink(formData, items, total, config);
  window.open(link, '_blank');
};
