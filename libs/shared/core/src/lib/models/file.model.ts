import { ApiResponse } from './api-response.model';

/**
 * api response interface for files
 *
 * @export
 * @interface FileResponse
 * @extends {ApiResponse}
 */
export interface FileResponse extends ApiResponse {
  file: FileModel;
}

/**
 * file model interface
 *
 * @export
 * @interface FileModel
 */
export interface FileModel {
  name?: string;
  extension?: string;
  origin?: string;
  url: string;
  tags?: string[];
  thumbnails?: Thumbnails;
  default?: boolean;
}

export interface Thumbnails {
  small?: string;
  medium?: string;
  original?: string;
}

/**
 * file upload interface
 *
 * @export
 * @interface FileUpload
 */
export interface FileUpload {
  file: File;
  directory: string;
}

/**
 * list of directories allowed to save files in the cloud
 *
 * @export
 * @enum {number}
 */
export enum AllowedFilesDirectory {
  Public = 'public',
}
/**
 * list of status files uploads
 *
 * @export
 * @enum {number}
 */
export enum FileUploadStatus {
  Uploading = 'Uploading',
  UploadFail = 'UploadFail',
  UploadWaiting = 'UploadWaiting',
  UploadSuccess = 'UploadSuccess',
  AdultContent = 'AdultContent',
}

export enum ImageSizes {
  SMALL = 'small',
  MEDIUM = 'medium',
  ORIGINAL = 'original',
}
