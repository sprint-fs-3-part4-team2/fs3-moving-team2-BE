# 무빙

## 프로젝트 소개

- 이사 소비자와 이사 전문가 매칭 서비스
- 🗓️ 프로젝트 기간: 2025.02.18 ~ 2025.04.10

# 풀스택 3기 파트4 2팀

## 링크
- [팀 문서](https://weak-lancer-c84.notion.site/1a06152b67c6817ebfd7c32764490c9f?v=1a06152b67c681a39668000c39caa079&pvs=4)
- [배포 링크](https://api.moving-app.site)

## 팀원 구성
| 이름 | Github |
|------|---------|
| 강대원| https://github.com/Daewony |
| 김태훈| https://github.com/Zero5338 |
| 김현묵| https://github.com/kimhyunmook |
| 배진한| https://github.com/Jin-coding-333 |
| 전준기| https://github.com/JeonJun02 |
| 정유석| https://github.com/yousuk88 | 
| 최종훈| https://github.com/jonghun4 | 
| 최혜지| https://github.com/heziss |
| 함헌규| https://github.com/heonq |

## 기술 스택

- Express.js
- Typescript
- Prisma ORM
- Postgre SQL
- Bcrypt
- Superstruct
- EC2
- RDS
- S3
- JWT

---

## 팀원별 구현 기능 상세

## 프로젝트 DB ERD

![무빙 ERD](https://github.com/user-attachments/assets/3417c4a3-59c3-4c9a-b2ca-5cfa30b77c32)

### 강대원


### 김태훈


### 김현묵


### 배진한


### 전준기


### 정유석


### 최종훈


### 최혜지


### 함헌규

#### 백엔드 배포 설정
- EC2에 백엔드 저장소를 clone하여 pm2를 사용해 지속적으로 실행, nginx를 통해 리버스 프록시 설정하여 서버 URL로 접속 시 실행중인 서버에 접속하도록 설정, DB는 RDS postgre SQL을 사용

#### S3+Cloudfront로 정적 데이터 관리
- 파라미터로 파일 이름을 입력받아 업로드에 사용할 Presigned Url과 업로드된 파일의 URL을 응답

#### 로그인/회원가입 API
- JWT에 회원의 ID와 프로필 ID(일반/기사 회원에 해당하는 ID) 그리고 유저 타입을 저장하고 쿠키를 통해 응답

#### OAuth API 구현
- 네이버,카카오,구글 계정을 사용한 로그인/회원가입 API 구현
- 동일한 이메일로 다른 회원유형(일반/기사님)계정이 존재할 경우 알림을 표시하도록 처리

#### 리프레쉬 토큰 API
- 전달받은 리프레쉬 토큰을 검증하고 액세스 토큰을 갱신하여 쿠키를 통해 응답

#### 유저 정보 추출 미들웨어
- 쿠키에 담긴 JWT를 decode하여 Req.user 객체에 userId,roleId,userType 값을 할당하는 미들웨어 구현

#### 유저 타입 검증 미들웨어
- API마다 호출 가능한 유저 타입이 달라지는데 Req.user에 저장된 userType을 통해서 호출 가능한 타입의 사용자인지 확인하고 아닐 경우 401 상태와 메시지를 응답하는 미들웨어 구현

#### 견적 요청 취소 API
- 견적 요청의 ID를 파라미터로 입력하여 해당 견적 요청을 취소
- API를 호출한 사용자가 해당 견적 요청을 신청한 사용자가 아닐 경우 401 코드와 메시지를 응답
- 견적 요청의 상태가 QUOTE_REQUESTED가 아닌 경우 409 코드와 메시지를 응답

#### 일반 사용자가 조회하는 견적 상세 정보 API

#### 기사 사용자가 보낸 견적 목록을 조회하는 API

#### 기사 사용자가 조회하는 견적 상세 정보 API
