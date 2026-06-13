/**
 * Output port for scaffolding workspace files and directories.
 * Implemented in the infrastructure layer using Node.js `fs/promises`.
 */
export interface IScaffoldingRepo {
  writeFile(filePath: string, content: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  fileExists(filePath: string): Promise<boolean>;
  createDirectory(dirPath: string): Promise<void>;
}
