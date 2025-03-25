import { Request, Response } from 'express';
import * as quoteService from '../service/userQuotesService';
import { AUTH_MESSAGES } from '@/constants/authMessages';
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

// // 대기 중인 견적 목록 조회
// export async function getPendingQuotes(req: Request, res: Response): Promise<Response> {
//   try {
//     const { customerId } = req.query;
//     if (!customerId) {
//       return res.status(400).json({ error: AUTH_MESSAGES.needLogin });
//     }
//     const pendingQuotes = await quoteService.getPendingQuotes(customerId as string);
//     console.log('대기 중인 견적 목록:', pendingQuotes);
//     return res.status(200).json({ data: pendingQuotes });
//   } catch (error) {
//     return handleError(error, res);
//   }
// }

// 대기 중인 견적 목록 조회
export async function getPendingQuotes(req: Request, res: Response): Promise<Response> {
  try {
    const { customerId } = req.query;

    console.log('받은 customerId:', customerId); // customerId 로그
    console.log('req.user.userId:', req.user?.userId); // req.user.userId 로그 출력

    if (!customerId || req.user?.userId !== customerId) {
      return res.status(400).json({ error: AUTH_MESSAGES.needLogin });
    }
    const pendingQuotes = await quoteService.getPendingQuotes(customerId as string);

    console.log('대기 중인 견적 목록:', pendingQuotes); // pendingQuotes 로그

    return res.status(200).json({ data: pendingQuotes });
  } catch (error) {
    return handleError(error, res);
  }
}

// 견적 확정
export async function confirmQuote(req: Request, res: Response): Promise<Response> {
  try {
    const { quoteRequestId, moverQuoteId } = req.body;
    if (!quoteRequestId || !moverQuoteId) {
      return res.status(400).json({ error: 'quoteRequestId와 moverQuoteId가 필요합니다.' });
    }
    await quoteService.confirmQuote(quoteRequestId, moverQuoteId);
    return res.status(200).json({ message: '견적이 확정되었습니다.' });
  } catch (error) {
    return handleError(error, res);
  }
}
