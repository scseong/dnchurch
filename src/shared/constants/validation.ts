import { EMAIL_REGEX, PASSWORD_REGEX, NAME_REGEX } from '@/shared/util/regex';

export const FORM_VALIDATIONS = {
  email: {
    required: '이메일 주소를 입력해주세요',
    pattern: {
      value: EMAIL_REGEX,
      message: '올바른 이메일 형식이 아닙니다.'
    }
  },
  password: {
    required: '비밀번호를 입력해주세요.',
    pattern: {
      value: PASSWORD_REGEX,
      message: '비밀번호는 영문, 숫자 포함 8자 이상이여야 합니다.'
    }
  },
  name: {
    required: '이름을 입력해주세요.',
    pattern: {
      value: NAME_REGEX,
      message: '한글 또는 영문으로만 입력해주세요.'
    }
  },
  username: {
    required: '프로필 이름을 입력해주세요.',
    maxLength: {
      value: 10,
      message: '10자 이내로 입력해주세요.'
    }
  }
} as const;
