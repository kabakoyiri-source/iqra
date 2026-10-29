import type { DocFile } from "./db";

const MAX_IMAGE_SIDE = 1000;
const MAX_INLINE_PDF = 450_000;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<string> {
  const source = await readAsDataUrl(file);
  const img = new Image();
  img.src = source;
  await img.decode();
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

/**
 * Prépare un fichier pour le stockage local : les images sont redimensionnées et
 * gardées en aperçu, les PDF légers sont conservés, les autres en métadonnées seules.
 */
export async function fileToDoc(file: File): Promise<DocFile> {
  const doc: DocFile = { name: file.name, type: file.type, size: file.size };
  try {
    if (file.type.startsWith("image/")) {
      doc.dataUrl = await compressImage(file);
    } else if (file.type === "application/pdf" && file.size <= MAX_INLINE_PDF) {
      doc.dataUrl = await readAsDataUrl(file);
    }
  } catch {
    // aperçu impossible : on garde les métadonnées
  }
  return doc;
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
