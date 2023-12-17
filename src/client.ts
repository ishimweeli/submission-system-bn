import { PrismaClient } from '@prisma/client';
import initialVariables from './config/initialVariables';

// add prisma to the NodeJS global type
interface CustomizedNodeJSGlobal extends Global {
  prisma: PrismaClient;
}

// prevent multiple instances of PrismaClient in dev mode
declare const global: CustomizedNodeJSGlobal;

const prisma = global.prisma || new PrismaClient();

if (initialVariables.env === 'development') {
  global.prisma = prisma;
}

export default prisma;
