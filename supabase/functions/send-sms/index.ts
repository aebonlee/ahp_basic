import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ICODE_HOST = "211.172.232.124";
const ICODE_PORT = 9201;
const SOCKET_TIMEOUT_MS = 10000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Korean characters → \uXXXX escape (replicating Java SMSComponent.encode)
 * This is required because the icodekorea TCP server expects this encoding.
 */
function encodeKorean(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Korean Jamo consonants (ㄱ-ㅎ): 0x3131-0x314E
    // Korean Jamo vowels (ㅏ-ㅣ): 0x314F-0x3163
    // Korean syllables (가-힣): 0xAC00-0xD7A3
    if (
      (code >= 0x3131 && code <= 0x314e) ||
      (code >= 0x314f && code <= 0x3163) ||
      (code >= 0xac00 && code <= 0xd7a3)
    ) {
      result += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Calculate EUC-KR byte length (Korean = 2 bytes, ASCII = 1 byte)
 */
function eucKrByteLength(text: string): number {
  let len = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (
      (code >= 0x3131 && code <= 0x314e) ||
      (code >= 0x314f && code <= 0x3163) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0x4e00 && code <= 0x9fff)
    ) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}

/**
 * Build the raw JSON string matching Java SMSComponent format.
 * Fields: key, tel, cb, date, msg, title
 * The msg and title fields are Unicode-escaped for Korean characters.
 */
function buildRequestJson(
  token: string,
  tel: string,
  cb: string,
  msg: string
): string {
  // Normalize newlines
  const cleanMsg = msg.replace(/\r\n/g, "\n");

  // Determine SMS vs LMS
  const byteLen = eucKrByteLength(cleanMsg);
  const title = byteLen <= 90 ? "" : "LMS";

  // Build JSON manually to match Java implementation:
  // The msg and title parts are Unicode-encoded
  const encodedMsg = encodeKorean(cleanMsg);
  const encodedTitle = encodeKorean(title);

  const json =
    `{"key":"${token}","tel":"${tel}","cb":"${cb}","date":"",` +
    `"msg":"${encodedMsg}","title":"${encodedTitle}"}`;

  return json;
}

/**
 * Build TCP frame: [2-byte type][4-byte length][JSON body]
 */
function buildFrame(json: string): Uint8Array {
  const encoder = new TextEncoder();
  const bodyBytes = encoder.encode(json);
  const typeBytes = encoder.encode("06");
  const lenStr = String(bodyBytes.length).padStart(4, "0");
  const lenBytes = encoder.encode(lenStr);

  const frame = new Uint8Array(
    typeBytes.length + lenBytes.length + bodyBytes.length
  );
  frame.set(typeBytes, 0);
  frame.set(lenBytes, 2);
  frame.set(bodyBytes, 6);
  return frame;
}

/**
 * Parse response frame: [2-byte type "02"][4-byte length][result body]
 * Result body: first 2 chars = "00" success, else failure
 */
function parseResponse(buf: Uint8Array, n: number): { success: boolean; raw: string } {
  if (n < 6) {
    return { success: false, raw: "응답 데이터 부족" };
  }
  const decoder = new TextDecoder();
  const msgType = decoder.decode(buf.subarray(0, 2));
  if (msgType !== "02") {
    return { success: false, raw: `알 수 없는 응답 타입: ${msgType}` };
  }

  const body = decoder.decode(buf.subarray(6, n));
  const resultCode = body.substring(0, 2);

  return {
    success: resultCode === "00",
    raw: body,
  };
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("ICODE_TOKEN");
    const senderNumber = Deno.env.get("SMS_SENDER_NUMBER");

    if (!token || !senderNumber) {
      return new Response(
        JSON.stringify({ error: "SMS 환경변수가 설정되지 않았습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { receiver, message } = await req.json();

    if (!receiver || !message) {
      return new Response(
        JSON.stringify({ error: "receiver와 message는 필수입니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip non-digits from phone number
    const tel = receiver.replace(/\D/g, "");

    // Build request JSON and frame
    const json = buildRequestJson(token, tel, senderNumber, message);
    const frame = buildFrame(json);

    // TCP connection with timeout
    const conn = await Deno.connect({
      hostname: ICODE_HOST,
      port: ICODE_PORT,
    });

    try {
      // Set read timeout via AbortSignal
      const timeoutId = setTimeout(() => conn.close(), SOCKET_TIMEOUT_MS);

      await conn.write(frame);

      const buf = new Uint8Array(4096);
      const n = await conn.read(buf);
      clearTimeout(timeoutId);

      if (n === null || n === 0) {
        return new Response(
          JSON.stringify({ error: "서버 응답이 없습니다." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = parseResponse(buf, n);

      return new Response(
        JSON.stringify({
          success: result.success,
          message: result.success ? "발송 완료" : "발송 실패",
          detail: result.raw,
        }),
        {
          status: result.success ? 200 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } finally {
      try {
        conn.close();
      } catch {
        // already closed
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `SMS 발송 오류: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
