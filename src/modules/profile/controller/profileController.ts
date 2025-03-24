import { Request, Response, RequestHandler } from 'express';
import * as profileService from '../service/profileService';

const regionMap: Record<string, string> = {
  서울: 'SEOUL',
  부산: 'BUSAN',
  대구: 'DAEGU',
  인천: 'INCHEON',
  광주: 'GWANGJU',
  대전: 'DAEJEON',
  울산: 'ULSAN',
  세종: 'SEJONG',
  경기: 'GYEONGGI',
  강원: 'GANGWON',
  충북: 'CHUNGBUK',
  충남: 'CHUNGNAM',
  전북: 'JEONBUK',
  전남: 'JEONNAM',
  경북: 'GYEONGBUK',
  경남: 'GYEONGNAM',
  제주: 'JEJU',
};

const moveTypeMap: Record<string, string> = {
  소형이사: 'SMALL_MOVE',
  가정이사: 'HOME_MOVE',
  사무실이사: 'OFFICE_MOVE',
};

// 고객 프로필 등록 (이미지, 이용 서비스, 지역)
export async function postCustomerProfileInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId ?? '';
    console.log(userId);
    if (!userId) {
      res.status(401).json({ message: '등록된 유저가 아닙니다' });
      return;
    }

    // 프로필 있는지 확인->있으면 에러 메세지
    const profile = await profileService.findCustomerProfile(userId);
    if (profile) {
      res.status(409).json({ message: '프로필이 이미 등록되어 있습니다' });
      return;
    }

    const { profileImage, selectedMoveTypes, selectedRegions } = req.body;
    // db에 맞는 타입으로 변환
    const locations = selectedRegions.map((region: string) => regionMap[region]);
    const serviceTypes = selectedMoveTypes.map((type: string) => moveTypeMap[type]);

    // 등록
    const postData = await profileService.createUserProfile({
      userId,
      profileImage,
      serviceTypes,
      locations,
    });
    res.status(201).json({
      message: '등록 성공!',
      data: { postData },
    });
  } catch (err: any) {
    if (err.message === '프로필이 이미 등록되어 있습니다') {
      res.status(409).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: '서버 오류' });
  }
}
// 고객 프로필 수정 (이름, 이메일, 전화번호, 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인, 이미지, 이용 서비스, 지역)
export async function patchCustomerProfileInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId ?? '';

    if (!userId) {
      res.status(401).json({ message: '등록된 유저가 아닙니다' });
      return;
    }
    const {
      name,
      email,
      phoneAddress,
      passwordNew,
      profileImage,
      selectedMoveTypes,
      selectedRegions,
    } = req.body;
    // db에 맞는 타입으로 변환
    const locations = selectedRegions.map((region: string) => regionMap[region]);
    const serviceTypes = selectedMoveTypes.map((type: string) => moveTypeMap[type]);

    // 수정
    const patchData = await profileService.patchUserProfile({
      userId,
      name,
      email,
      phoneAddress,
      passwordNew,
      profileImage,
      locations,
      serviceTypes,
    });
    res.status(200).json({ message: '수정 완료!', data: patchData });
  } catch (err: any) {
    if (err.message === '이미 사용 중인 전화번호입니다') {
      res.status(409).json({ message: err.message });
      return;
    }
    console.log('error:', err);
  }
}
// 기사 프로필 등록 (이미지, 별명, 경력, 한 줄 소개, 상세설명, 제공 서비스, 지역)
export async function postMoverProfileInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId ?? '';

    if (!userId) {
      res.status(401).json({ message: '등록된 유저가 아닙니다' });
      return;
    }
    const {
      experience,
      shortIntro,
      description,
      profileImage,
      selectedMoveTypes,
      selectedRegions,
    } = req.body;
    // db에 맞는 타입으로 변환
    const locations = selectedRegions.map((region: string) => regionMap[region]);
    const serviceTypes = selectedMoveTypes.map((type: string) => moveTypeMap[type]);

    // 등록
    const postData = await profileService.createMoverProfile({
      userId,
      experience,
      shortIntro,
      description,
      profileImage,
      serviceTypes,
      locations,
    });
    res.status(201).json({
      message: '등록 성공!',
      data: { postData },
    });
  } catch (err: any) {
    console.log('error:', err);
    if (err.message === '프로필이 이미 등록되어 있습니다') {
      res.status(409).json({ message: err.message });
      return;
    }

    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}
// 기사 프로필 수정 (이미지, 별명, 경력, 한 줄 소개, 상세설명, 제공 서비스, 지역)
export async function patchMoverProfileInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId ?? '';

    if (!userId) {
      res.status(401).json({ message: '등록된 유저가 아닙니다' });
      return;
    }
    const {
      experience,
      shortIntro,
      description,
      profileImage,
      selectedMoveTypes,
      selectedRegions,
    } = req.body;
    // db에 맞는 타입으로 변환
    const locations = selectedRegions.map((region: string) => regionMap[region]);
    const serviceTypes = selectedMoveTypes.map((type: string) => moveTypeMap[type]);

    // 수정
    const postData = await profileService.patchMoverProfile({
      userId,
      experience,
      shortIntro,
      description,
      profileImage,
      serviceTypes,
      locations,
    });
    res.status(200).json({
      message: '수정 성공!',
      data: { postData },
    });
  } catch (err) {
    console.log('error:', err);
  }
}
