export const authReturnKey = "egark:auth-return";
export function safeAuthReturn(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/";
  const path = value.split(/[?#]/)[0];
  if (["/login", "/register", "/auth/callback"].includes(path)) return "/";
  return value;
}