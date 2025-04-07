export const getUniqueKoreanPhrase = () => {
  const timestamp = Date.now();

  const koreanNouns = [
    '하늘',
    '바다',
    '산',
    '꽃',
    '나무',
    '별',
    '구름',
    '강',
    '달',
    '태양',
    '바람',
    '비',
    '눈',
    '안개',
    '무지개',
    '땅',
    '숲',
    '들판',
    '계곡',
    '호수',
  ];

  const koreanAdjectives = [
    '푸른',
    '붉은',
    '하얀',
    '검은',
    '밝은',
    '어두운',
    '깊은',
    '높은',
    '맑은',
    '흐린',
    '따뜻한',
    '차가운',
    '넓은',
    '좁은',
    '둥근',
    '기다란',
  ];

  const lastDigits = timestamp % 1000;
  const nounIndex = lastDigits % koreanNouns.length;
  const adjIndex = Math.floor(lastDigits / 100) % koreanAdjectives.length;

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const timePhrase = `${hour}시${minute}분의`;

  // 유니크 식별자 (5자리)
  const uniqueId = (timestamp % 100000).toString().padStart(5, '0');

  // 최종 문구 생성
  return `${timePhrase} ${koreanAdjectives[adjIndex]} ${koreanNouns[nounIndex]}_${uniqueId}`;
};
