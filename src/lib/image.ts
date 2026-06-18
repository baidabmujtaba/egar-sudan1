// Helpers for Supabase Storage image transformations.
// Rewrites public object URLs to the on-the-fly render endpoint so we can
// request small thumbnails (faster loads, less data) instead of full-size files.

type Opts = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

export function thumb(url?: string | null, opts: Opts = {}): string {
  if (!url) return "";
  if (!url.includes(OBJECT_PATH)) return url;
  const { width = 600, quality = 70, resize = "cover", height } = opts;
  const rendered = url.replace(OBJECT_PATH, RENDER_PATH);
  const params = new URLSearchParams();
  params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  params.set("resize", resize);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}${params.toString()}`;
}

/** Build a srcSet for responsive cards. */
export function thumbSrcSet(url?: string | null, widths: number[] = [320, 480, 640, 960]): string {
  if (!url || !url.includes(OBJECT_PATH)) return "";
  return widths.map((w) => `${thumb(url, { width: w })} ${w}w`).join(", ");
}