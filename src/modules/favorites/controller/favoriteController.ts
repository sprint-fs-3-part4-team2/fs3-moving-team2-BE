import { Request, Response } from 'express';
import * as favoriteService from '../service/favoriteService';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { HttpException, NotFoundException } from '@/core/errors';

// 오류 처리 함수
function handleError(error: unknown, res: Response) {
  const err = error as Error;
  if (err instanceof NotFoundException || err instanceof HttpException) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  return res.status(500).json({ error: '요청을 처리하는 데 실패했습니다.' });
}

// 찜한 목록 조회
export async function getFavorites(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req?.user?.userId ?? '';
    const roleId = req?.user?.roleId ?? '';
    if (!userId || !roleId) {
      return res.status(400).json({ error: AUTH_MESSAGES.needLogin });
    }
    const favorites = await favoriteService.getFavorites(roleId);
    return res.status(200).json({ data: favorites });
  } catch (error) {
    return handleError(error, res);
  }
}

// 찜하기 추가
export async function addFavorite(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req?.user?.roleId ?? '';
    const moverId = req?.params?.moverId ?? '';
    if (!userId || !moverId) {
      return res.status(400).json({ error: 'userId와 moverId가 필요합니다.' });
    }
    const favorite = await favoriteService.addFavorite(userId, moverId);
    return res.status(201).json(favorite);
  } catch (error) {
    return handleError(error, res);
  }
}

// 찜하기 취소
export async function removeFavorite(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req?.user?.roleId ?? '';
    const moverId = req?.params?.moverId ?? '';
    if (!userId || !moverId) {
      return res.status(400).json({ error: 'userId와 moverId가 필요합니다.' });
    }
    const result = await favoriteService.removeFavorite(userId, moverId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
}

// 찜하기 상태 확인
export async function checkFavoriteStatus(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req?.user?.roleId ?? '';
    const moverId = req?.params?.moverId ?? '';
    if (!userId || !moverId) {
      return res.status(400).json({ error: 'userId와 moverId가 필요합니다.' });
    }
    const result = await favoriteService.checkFavoriteStatus(userId, moverId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
}
