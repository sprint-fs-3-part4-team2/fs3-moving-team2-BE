import { setupGoogleStrategy } from './google.strategy';
import { setupKakaoStrategy } from './kakao.strategy';
import { setupNaverStrategy } from './naver.strategy';

export const setupAuthStrategies = () => {
  setupGoogleStrategy();
  setupKakaoStrategy();
  setupNaverStrategy();
};
