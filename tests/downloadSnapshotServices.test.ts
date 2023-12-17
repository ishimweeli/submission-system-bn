import { BadRequestError, NotFoundError } from '../src/utils/errorhandler';
import prisma from '../src/client';
import axios, { AxiosResponse } from 'axios';

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sanitizeFilename from 'sanitize-filename';
import downloadSnapShootServices from '../src/services/downloadSnapShootServices';
jest.mock('axios');
jest.mock('uuid');
jest.mock('sanitize-filename');

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn()
    },
    submission: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    snapshot: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('getSnapshotFilepath', () => {
  it('should return the snapshot filepath if the submission and snapshot exist', async () => {
    const mockSubmissionId = 1;
    const mockSnapshotId = 1;
    const mockSubmission = {
      id: mockSubmissionId,
      snapshots: [{ id: mockSnapshotId, filepath: 'path1' }]
    };

    prisma.submission.findUnique = jest.fn().mockResolvedValue(mockSubmission);
    const result = await downloadSnapShootServices.getSnapshotFilepath(
      mockSubmissionId,
      mockSnapshotId
    );
    expect(prisma.submission.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockSubmission.snapshots[0].filepath);
  });

  it('should throw an error if the database query fails', async () => {
    const mockSubmissionId = 1;
    const mockSnapshotId = 1;

    prisma.submission.findUnique = jest.fn().mockRejectedValue(new Error('Database query failed'));
    await expect(
      downloadSnapShootServices.getSnapshotFilepath(mockSubmissionId, mockSnapshotId)
    ).rejects.toThrow('Failed to download snapshot');
    expect(prisma.submission.findUnique).toHaveBeenCalled();
  });
});


describe('downloadAndSendZip', () => {
  it('should download the zip file and send it in the response', async () => {
    const mockUrl = 'http://example.com/file.zip';
    const mockData = Buffer.from('mock data');
    const mockResponse = { data: mockData };
    const mockUuid = '1234';
    const mockSanitizedFilename = '1234.zip';
    const mockRes = {
      setHeader: jest.fn(),
      send: jest.fn()
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
    (sanitizeFilename as jest.Mock).mockReturnValue(mockSanitizedFilename);

    await downloadSnapShootServices.downloadAndSendZip(mockUrl, mockRes as unknown as Response,1);

    expect(axios.get).toHaveBeenCalledWith(mockUrl, { responseType: 'arraybuffer' });
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    expect(mockRes.send).toHaveBeenCalledWith(mockData);
  });

  it('should throw an error if the download fails', async () => {
    const mockUrl = 'http://example.com/file.zip';
    const mockRes = {
      setHeader: jest.fn(),
      send: jest.fn()
    };

    (axios.get as jest.Mock).mockRejectedValue(new Error('Download failed'));

    await expect(
      downloadSnapShootServices.downloadAndSendZip(mockUrl, mockRes as unknown as Response, 1)
    ).rejects.toThrow('Failed to download snapshot');

    expect(axios.get).toHaveBeenCalledWith(mockUrl, { responseType: 'arraybuffer' });
    expect(mockRes.setHeader).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });
});

describe('downloadAndSaveZipp', () => {
  it('should download the zip file and send it in the response', async () => {
    const mockUrl = 'http://example.com/file.zip';
    const mockSnapshotId = 1;
    const mockData = Buffer.from('mock data');
    const mockResponse = { data: mockData };
    const mockUuid = '1234';
    const mockSanitizedFilename = `${mockUuid}_${mockSnapshotId}.zip`;
    const mockRes = {
      setHeader: jest.fn(),
      send: jest.fn()
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
    (sanitizeFilename as jest.Mock).mockReturnValue(mockSanitizedFilename);

    await downloadSnapShootServices.downloadAndSaveZipp(
      mockUrl,
      mockRes as unknown as Response,
      mockSnapshotId,
      mockSnapshotId
    );

    expect(axios.get).toHaveBeenCalledWith(mockUrl, { responseType: 'arraybuffer' });
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream');
    expect(mockRes.send).toHaveBeenCalledWith(mockData);
  });

  it('should throw an error if the download fails', async () => {
    const mockUrl = 'http://example.com/file.zip';
    const mockSnapshotId = 1;
    const mockRes = {
      setHeader: jest.fn(),
      send: jest.fn()
    };

    (axios.get as jest.Mock).mockRejectedValue(new Error('Download failed'));

    await expect(
      downloadSnapShootServices.downloadAndSaveZipp(
        mockUrl,
        mockRes as unknown as Response,
        mockSnapshotId,
        mockSnapshotId
      )
    ).rejects.toThrow('Failed to download snapshot');

    expect(axios.get).toHaveBeenCalledWith(mockUrl, { responseType: 'arraybuffer' });
    expect(mockRes.setHeader).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });
});
import passwordValidator from '../src/utils/validations/customValidations';

describe('passwordValidator', () => {
  it('should validate a correct password', () => {
    const password = 'Password123!';
    const result = passwordValidator(password);
    expect(result).toBe(true);
  });

  it('should invalidate an incorrect password', () => {
    const password = 'password';
    const result = passwordValidator(password);
    expect(result).toBe(false);
  });
});
