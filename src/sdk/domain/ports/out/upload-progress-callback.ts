/**
 * Callback interface for upload progress updates
 */
export interface UploadProgressCallback {
  /**
   * Called when upload starts
   */
  onStart(total: number): void;

  /**
   * Called for each file being processed
   */
  onProgress(current: number, filePath: string): void;

  /**
   * Called when a file succeeds
   */
  onFileSuccess(filePath: string): void;

  /**
   * Called when a file fails
   */
  onFileError(filePath: string, error: Error): void;

  /**
   * Called when upload completes
   */
  onComplete(successCount: number, errorCount: number): void;
}
