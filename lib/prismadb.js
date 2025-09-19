// lib/prisma.js

import { PrismaClient } from '@prisma/client'

// Use a global variable to ensure that a single instance of PrismaClient is used
// across the entire application in development. This is a best practice for Next.js
// to prevent multiple instances from being created during hot-reloading, which
// can cause performance issues or exhaust database connections.

const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma