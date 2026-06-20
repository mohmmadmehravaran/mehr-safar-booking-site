/* ────────────────────────────────────────────────────────────────────────
   image.ts
   Convert an uploaded image File into a DOWNSCALED + COMPRESSED data URL.
   This prevents two problems:
     1) Huge base64 strings overflowing localStorage (which crashed the app
        with a white screen when saving edits).
     2) Oversized images rendering at their natural size and visually spilling
        over the layout / panels.
   ──────────────────────────────────────────────────────────────────────── */

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = src;
  });
}

export async function fileToCompressedDataURL(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<string> {
  const original = await readAsDataURL(file);

  // SVG / GIF can't be safely re-encoded through canvas — keep as-is.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return original;

  try {
    const img = await loadImage(original);
    const { width, height } = img;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    // If already small in both dimensions AND light in bytes, skip re-encoding.
    if (scale === 1 && original.length < 400_000) return original;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, w, h);

    const webp = canvas.toDataURL('image/webp', quality);
    if (webp && webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return original;
  }
}
