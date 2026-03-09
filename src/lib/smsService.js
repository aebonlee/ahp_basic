import { supabase } from './supabaseClient';

/**
 * 단일 수신자에게 SMS 발송 (Edge Function 호출)
 */
export async function sendSms({ receiver, message }) {
  const { data, error } = await supabase.functions.invoke('send-sms', {
    body: { receiver, message },
  });
  if (error) throw error;
  return data;
}

/**
 * 다수 수신자에게 순차 발송
 * @param {Array<{name: string, phone: string}>} recipients
 * @param {string} message
 * @param {(current: number, total: number) => void} onProgress
 * @returns {Promise<Array<{name: string, phone: string, success: boolean, result?: any, error?: string}>>}
 */
export async function sendSmsBulk(recipients, message, onProgress) {
  const results = [];
  for (let i = 0; i < recipients.length; i++) {
    try {
      const result = await sendSms({ receiver: recipients[i].phone, message });
      results.push({ ...recipients[i], success: result?.success ?? true, result });
    } catch (err) {
      results.push({ ...recipients[i], success: false, error: err.message });
    }
    onProgress?.(i + 1, recipients.length);
  }
  return results;
}
