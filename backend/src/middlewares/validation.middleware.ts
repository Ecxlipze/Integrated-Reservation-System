import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodError = error as any;
        return res.status(400).json({
          message: 'Validation failed',
          errors: zodError.issues ? zodError.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message })) : zodError.errors
        });
      }
      next(error);
    }
  };
};
