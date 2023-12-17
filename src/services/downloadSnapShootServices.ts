import { Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import sanitizeFilename from 'sanitize-filename';
import prisma from '../client';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { BadRequestError, NotFoundError } from '../utils/errorhandler';

const getSnapshotFilepath = async (
  submissionId: number,
  snapshotId: number
): Promise<string | null> => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        snapshots: {
          where: { id: snapshotId },
          select: { filepath: true }
        }
      }
    });

    if (!submission) {
      throw new BadRequestError('Submission not found');
    }

    if (submission.snapshots.length === 0) {
      throw new BadRequestError('Snapshot not found');
    }

    return submission.snapshots[0].filepath;
  } catch (error) {
    throw new BadRequestError('Failed to download snapshot');
  }
};


const getSnapshotFilepaths = async (submissionId: number): Promise<string[]> => {
  try {
    const snapshots = await prisma.snapshot.findMany({
      where: { submissionId },
      select: { filepath: true }
    });

    return snapshots.map((snapshot) => snapshot.filepath);
  } catch (error) {
    throw new BadRequestError('Failed to download snapshot');
  }
};

const downloadAndSendZip = async (
  url: string,
  res: Response,
  submissionId: number
): Promise<void> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const uniqueFilename = `${submissionId}.zip`;
    const sanitizedFilename: string = sanitizeFilename(uniqueFilename);

    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    throw new BadRequestError('Failed to download snapshot');
  }
};

const downloadAndSaveZipp = async (
  url: string,
  res: Response,
  submissionId: number,
  snapshotId: number
): Promise<void> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const uniqueFilename = `${submissionId}_${snapshotId}.zip`;
    const sanitizedFilename: string = sanitizeFilename(uniqueFilename);

    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    throw new BadRequestError('Failed to download snapshot');
  }
};

const getFilenameFromPath = (filepath) => {
  return filepath.split('/').pop();
};

const downloadSnapshot = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    return response.data;
  } catch (error) {
    throw new BadRequestError('Failed to download snapshot');
  }
};

const downloadAllSnapshots = async (submissionId: number, res: Response) => {
  try {
    const snapshotFilepaths = await getSnapshotFilepaths(submissionId);

    if (snapshotFilepaths.length === 0) {
      throw new NotFoundError('No snapshots found');
    }

    const zipStream = archiver('zip');
    const uniqueFilename = `$${submissionId}.zip`;
    const sanitizedFilename: string = sanitizeFilename(uniqueFilename);
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}`);
    res.setHeader('Content-Type', 'application/octet-stream');

    zipStream.pipe(res);

    for (const filepath of snapshotFilepaths) {
      const filename = getFilenameFromPath(filepath);
      const downloadStream = await downloadSnapshot(filepath);
      zipStream.append(downloadStream, { name: filename });
    }

    zipStream.finalize();
    zipStream.on('end', () => {
      for (const filepath of snapshotFilepaths) {
        fs.unlink(path.join(__dirname, filepath), (err) => {
          if (err) throw new BadRequestError('Error deleting snapshot');
        });
      }
    });
  } catch (error) {
    throw new BadRequestError('Error downloading snapshots');
  }
};

export default {
  downloadAndSendZip,
  getSnapshotFilepath,
  downloadAllSnapshots,
  downloadAndSaveZipp,
  getSnapshotFilepaths
};
