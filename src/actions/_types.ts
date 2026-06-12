// Server Action 공통 반환 형식 (ADR 0016). 데이터가 필요한 액션만 제네릭을 채운다.
export type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};
