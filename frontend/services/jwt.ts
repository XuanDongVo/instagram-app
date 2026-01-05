export type JwtPayload = {
  sub?: string;
  role?: string; // backend đang set claim role = "USER" | "ADMIN"
  exp?: number;
  [key: string]: any;
};

function base64UrlToBase64(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  return base64 + (pad ? "=".repeat(4 - pad) : "");
}

function decodeBase64ToString(base64: string): string {
  // 1) Web / một số môi trường có atob
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(base64);
  }

  // 2) Nếu có Buffer (thường có trong một số setup RN)
  const anyGlobal: any = globalThis as any;
  if (anyGlobal.Buffer) {
    return anyGlobal.Buffer.from(base64, "base64").toString("utf8");
  }

  // 3) Fallback: decode thủ công (đủ dùng cho JWT payload)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let str = "";
  let i = 0;

  base64 = base64.replace(/=+$/, "");
  while (i < base64.length) {
    const enc1 = chars.indexOf(base64.charAt(i++));
    const enc2 = chars.indexOf(base64.charAt(i++));
    const enc3 = chars.indexOf(base64.charAt(i++));
    const enc4 = chars.indexOf(base64.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    str += String.fromCharCode(chr1);
    if (enc3 !== -1 && !Number.isNaN(enc3)) str += String.fromCharCode(chr2);
    if (enc4 !== -1 && !Number.isNaN(enc4)) str += String.fromCharCode(chr3);
  }

  // cố gắng chuyển về UTF-8
  try {
    return decodeURIComponent(
      str.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
  } catch {
    return str;
  }
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadBase64 = base64UrlToBase64(parts[1]);
    const json = decodeBase64ToString(payloadBase64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromAccessToken(accessToken?: string | null): string | null {
  if (!accessToken) return null;
  const payload = decodeJwt(accessToken);
  return payload?.role ?? null;
}
