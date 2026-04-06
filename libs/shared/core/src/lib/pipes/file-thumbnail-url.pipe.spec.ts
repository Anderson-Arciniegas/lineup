import { FileThumbnailUrlPipe, getFileThumbnailUrl } from './file-thumbnail-url.pipe';
import type { FileSchema } from '../schemas/file.schema';

describe('getFileThumbnailUrl', () => {
  it('returns empty string when file is missing', () => {
    expect(getFileThumbnailUrl(undefined)).toBe('');
    expect(getFileThumbnailUrl(null)).toBe('');
  });

  it('returns empty string when file.url is missing', () => {
    expect(getFileThumbnailUrl({} as FileSchema)).toBe('');
  });

  it('returns main url when thumbnails are absent', () => {
    const file: FileSchema = {
      directory: 'd',
      extension: 'jpg',
      idCreationUser: 1,
      name: 'n',
      url: 'https://cdn.example/full.jpg',
    };
    expect(getFileThumbnailUrl(file, 'md')).toBe('https://cdn.example/full.jpg');
  });

  it('returns thumbnail url for size when present', () => {
    const file: FileSchema = {
      directory: 'd',
      extension: 'jpg',
      idCreationUser: 1,
      name: 'n',
      url: 'https://cdn.example/full.jpg',
      thumbnails: {
        md: { height: 400, width: 400, url: 'https://cdn.example/md.jpg' },
        sm: { height: 200, width: 200, url: 'https://cdn.example/sm.jpg' },
        xs: { height: 100, width: 100, url: 'https://cdn.example/xs.jpg' },
      },
    };
    expect(getFileThumbnailUrl(file, 'sm')).toBe('https://cdn.example/sm.jpg');
    expect(getFileThumbnailUrl(file, 'xs')).toBe('https://cdn.example/xs.jpg');
  });

  it('falls back to main url when thumbnail url is blank', () => {
    const file: FileSchema = {
      directory: 'd',
      extension: 'jpg',
      idCreationUser: 1,
      name: 'n',
      url: 'https://cdn.example/full.jpg',
      thumbnails: {
        md: { height: 400, width: 400, url: '   ' },
        sm: { height: 200, width: 200, url: 'https://cdn.example/sm.jpg' },
        xs: { height: 100, width: 100, url: 'https://cdn.example/xs.jpg' },
      },
    };
    expect(getFileThumbnailUrl(file, 'md')).toBe('https://cdn.example/full.jpg');
  });
});

describe('FileThumbnailUrlPipe', () => {
  const pipe = new FileThumbnailUrlPipe();

  it('defaults to md', () => {
    const file: FileSchema = {
      directory: 'd',
      extension: 'jpg',
      idCreationUser: 1,
      name: 'n',
      url: 'https://x/y.jpg',
      thumbnails: {
        md: { height: 1, width: 1, url: 'https://x/md.jpg' },
        sm: { height: 1, width: 1, url: 'https://x/sm.jpg' },
        xs: { height: 1, width: 1, url: 'https://x/xs.jpg' },
      },
    };
    expect(pipe.transform(file)).toBe('https://x/md.jpg');
  });
});
