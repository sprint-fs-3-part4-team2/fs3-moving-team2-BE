/** @type {import('ts-jest').JestConfigWithTsJest} * */

module.exports = {
  // TypeScript 기반으로 Jest 실행
  preset: 'ts-jest',
  // Express는 서버 환경이므로 "node" 설정
  testEnvironment: 'node',
  // @/ 경로 별칭을 Jest에서도 적용
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@prismaDir/(.*)$': '<rootDir>/prisma/$1',
  },
  // ts, tsx, js, json 파일을 Jest에서 인식
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  // ts, ts 파일을 ts-jest로 변환
  transform: {
    '^.+\\.tsx?$': ['ts-jest'],
  },
  // Jest 실행 전에 실행할 파일 설정
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  // Jest 실행 시 무시할 경로 설정
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // 커버리지 수집 설정
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
};
