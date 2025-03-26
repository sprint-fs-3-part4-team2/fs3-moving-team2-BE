import { ValidatedQuery } from '@/types/express';
import { NextFunction, Request, Response } from 'express';
import { create, Struct, StructError } from 'superstruct';

type ValidationType = 'body' | 'query';

const validate = <T, Type extends ValidationType>(schema: Struct<T>, type: Type) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = type === 'body' ? req.body : req.query;
      const validated = create(data, schema);

      if (type === 'body') {
        req.body = validated;
      } else {
        req.validatedQuery = validated as ValidatedQuery;
      }

      next();
    } catch (error) {
      if (error instanceof StructError) {
        const detailedError = {
          message: `검증 오류: ${error.path.join('.')} - ${error.message}`,
          path: error.path,
          value: error.value,
          type: error.type,
          refinement: error.refinement,
        };

        res.status(400).json(detailedError);
        return;
      }
      next(error);
    }
  };
};

export const validateBody = <T>(schema: Struct<T>) => validate(schema, 'body');
export const validateQuery = <T>(schema: Struct<T>) => validate(schema, 'query');
