import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
declare const JWT_SECRET: string;
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorize: (...roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { JWT_SECRET };
//# sourceMappingURL=auth.d.ts.map