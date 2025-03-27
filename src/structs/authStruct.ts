import { Infer, object, refine, string } from 'superstruct';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_PATTERN = /^01([0|1|6|7|8|9])(-?\d{3,4})(-?\d{4})$/;

const emailValidator = () =>
  refine(string(), '이메일 형식이 올바르지 않습니다.', (value) => EMAIL_PATTERN.test(value));

const passwordValidator = () =>
  refine(string(), '비밀번호는 8자 이상이어야 합니다.', (value) => value.length >= 8);

const phoneNumberValidator = () =>
  refine(string(), '올바르지 않은 전화번호 형식입니다.', (value) =>
    PHONE_NUMBER_PATTERN.test(value),
  );

export const SignUpRequestStruct = object({
  email: emailValidator(),
  name: string(),
  phoneNumber: phoneNumberValidator(),
  password: passwordValidator(),
  passwordConfirmation: string(),
});

export const signUpValidator = refine(
  SignUpRequestStruct,
  '비밀번호 확인이 일치하지 않습니다.',
  (value) => value.password === value.passwordConfirmation,
);

export const signInRequestStruct = object({
  email: emailValidator(),
  password: passwordValidator(),
});

export type SignUpRequest = Omit<Infer<typeof SignUpRequestStruct>, 'passwordConfirmation'>;
export type SignInRequest = Infer<typeof signInRequestStruct>;
