import { UserRole } from '../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: UserRole;
    };
  }
}
