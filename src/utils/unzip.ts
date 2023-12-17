import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import sanitizeFilename from 'sanitize-filename';
import * as fs from 'fs';
import AdmZip from 'adm-zip';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { BadRequestError } from './errorhandler';

interface FileContent {
  type: 'file' | 'folder';
  path: string;
  content?: string | FileContent[];
}

const readAndDisplayFileContent = async (filePath: string): Promise<FileContent> => {
  try {
    const stats = fs.lstatSync(filePath);

    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath);
      let directoryContent: FileContent[] = [];

      for (const file of files) {
        const fileContent = await readAndDisplayFileContent(path.join(filePath, file));
        if (fileContent) {
          directoryContent.push(fileContent);
        }
      }

      return {
        type: 'folder',
        path: path.basename(filePath),
        content: directoryContent,
      };
    } else if (stats.isFile()) {
      if (filePath.endsWith('.zip') || filePath.endsWith('.lock')) {
        throw new BadRequestError('Invalid file type');
      } else {
        const content = await fsPromises.readFile(filePath, 'utf-8');

        return {
          type: 'file',
          path: path.basename(filePath),
          content,
        };
      }
    }

    throw new BadRequestError('Unexpected file type');
  } catch (error) {
    throw new BadRequestError(`Error reading file:`);
  }
};

const downloadAndUnzip = async (url: string, outputDirectory: string): Promise<{ snapshots: FileContent[] }> => {
  const uniqueExtractDir = path.join(outputDirectory, uuidv4());
  const snapshots: FileContent[] = [];

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    fs.mkdirSync(uniqueExtractDir, { recursive: true });

    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    let rootFolder: FileContent = {
      type: 'folder',
      path: path.basename(uniqueExtractDir),
      content: [],
    };
    let currentFolder: FileContent | null = rootFolder;

    for (const zipEntry of entries) {
      const sanitizedFilename = sanitizeFilename(zipEntry.entryName);
      const filePath = path.join(uniqueExtractDir, sanitizedFilename);

      if (zipEntry.isDirectory) {
        // Handle subfolders
        const newFolder: FileContent = {
          type: 'folder',
          path: sanitizedFilename,
          content: [],
        };
        if (currentFolder) {
          if (Array.isArray(currentFolder.content)) {
            currentFolder.content.push(newFolder);
          } else {
            currentFolder.content = [newFolder];
          }
        } else {
          snapshots.push(newFolder);
        }
        

        currentFolder = newFolder;
      } else {
        // Handle files
        zip.extractEntryTo(zipEntry, filePath);

        const fileContent = await readAndDisplayFileContent(filePath);
        if (fileContent && currentFolder) {
          if (Array.isArray(currentFolder.content)) {
            currentFolder.content.push(fileContent);
          } else {
            currentFolder.content = [fileContent];
          }
        }
        
      }
    }

    snapshots.push(rootFolder); 

    setTimeout(async () => {
      try {
        await fsPromises.rmdir(outputDirectory, { recursive: true });
      } catch (deleteError) {
        throw new BadRequestError('Failed to delete temporary directory');
      }
    }, 5 * 60 * 1000);

    return { snapshots };
  } catch (error) {
    throw new BadRequestError(`Failed to download snapshot: `);
  }
};

export { downloadAndUnzip, readAndDisplayFileContent };
