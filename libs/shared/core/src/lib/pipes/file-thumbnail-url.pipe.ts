import { Pipe, PipeTransform } from '@angular/core';
import type { FileSchema } from '../schemas/file.schema';

export type FileThumbnailSize = 'md' | 'sm' | 'xs';

/**
 * Resuelve la URL de miniatura para el tamaño dado, o la URL principal del archivo.
 */
export function getFileThumbnailUrl(
  file: FileSchema | null | undefined,
  size: FileThumbnailSize = 'md',
): string {
  if (!file?.url) {
    return '';
  }
  const thumb = file.thumbnails?.[size]?.url?.trim();
  if (thumb) {
    return thumb;
  }
  return file.url;
}

@Pipe({
  name: 'fileThumbnailUrl',
  standalone: true,
})
export class FileThumbnailUrlPipe implements PipeTransform {
  transform(
    file: FileSchema | null | undefined,
    size: FileThumbnailSize = 'md',
  ): string {
    return getFileThumbnailUrl(file, size);
  }
}
