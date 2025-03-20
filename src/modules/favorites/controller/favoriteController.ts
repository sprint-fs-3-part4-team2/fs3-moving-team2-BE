import { Request, Response } from 'express';
import * as favoriteService from '../service/favoriteService';

// 찜한 목록 조회
export async function getFavorites(req: Request, res: Response): Promise<void> {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      res.status(400).json({ error: 'customerId가 필요합니다.' });
      return;
    }
    const favorites = await favoriteService.getFavorites(customerId as string);
    res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '찜한 목록을 가져오는 데 실패했습니다.' });
  }
}

// 찜하기 추가
export async function addFavorite(req: Request, res: Response) {
  try {
    const { customerId, moverId } = req.body;
    const favorite = await favoriteService.addFavorite(customerId, moverId);
    res.status(201).json(favorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '찜하기 추가 실패' });
  }
}

// 찜하기 취소
export async function removeFavorite(req: Request, res: Response) {
  try {
    const { customerId, moverId } = req.body;
    const result = await favoriteService.removeFavorite(customerId, moverId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '찜하기 취소 실패' });
  }
}
