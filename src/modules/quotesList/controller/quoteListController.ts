import { Request, Response } from 'express';
import * as quoteListService from '../service/quoteListService';
import { HttpException } from '@/core/errors/httpException';
import { NotFoundException } from '@/core/errors/notFoundException';

// 오류 처리 함수
function handleError(error: unknown, res: Response) {
  const err = error as Error;
  if (err instanceof NotFoundException || err instanceof HttpException) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  return res.status(500).json({ error: '요청을 처리하는 데 실패했습니다.' });
}

// 내 견적 요청 목록 조회
export async function getQuoteRequests(req: Request, res: Response) {
  try {
    const userId = req.userInfo?.userId ?? '';
    const roleId = req.userInfo?.roleId ?? '';
    const quoteRequests = await quoteListService.getQuoteRequests(
      userId as string,
      roleId as string,
    );
    return res.status(200).json({ data: quoteRequests });
  } catch (error) {
    return handleError(error, res);
  }
}

// 기사님에게 받은 견적 목록 조회
export async function getQuotesFromDrivers(req: Request, res: Response) {
  try {
    const userId = req?.userInfo?.roleId ?? '';
    const quoteRequestedId = req?.params?.quoteRequestId ?? '';
    if (!userId || !quoteRequestedId) {
      return res.status(400).json({ error: 'userId와 quoteRequestedId 필요합니다.' });
    }
    const quotesFromDrivers = await quoteListService.getQuotesFromDrivers(
      userId as string,
      quoteRequestedId as string,
    );
    return res.status(200).json({ data: quotesFromDrivers });
  } catch (error) {
    return handleError(error, res);
  }
}
