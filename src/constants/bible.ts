// 성경 66권 참조 데이터 (개역개정 기준, 총 1189장).
// 고정값이라 DB 테이블 대신 상수로 둔다 (exec-plan bible-reading-tracker D2).
// 기록에는 order(1-66 정경 순번)만 저장하고, 이름·장수는 여기서 가져온다.

export type Testament = '구약' | '신약';

type BibleBook = {
  /** 정경 순번 1-66. DB `book_order`와 1:1. */
  order: number;
  name: string;
  chapters: number;
  testament: Testament;
};

const RAW_BOOKS: ReadonlyArray<[name: string, chapters: number, testament: Testament]> = [
  ['창세기', 50, '구약'], ['출애굽기', 40, '구약'], ['레위기', 27, '구약'], ['민수기', 36, '구약'],
  ['신명기', 34, '구약'], ['여호수아', 24, '구약'], ['사사기', 21, '구약'], ['룻기', 4, '구약'],
  ['사무엘상', 31, '구약'], ['사무엘하', 24, '구약'], ['열왕기상', 22, '구약'], ['열왕기하', 25, '구약'],
  ['역대상', 29, '구약'], ['역대하', 36, '구약'], ['에스라', 10, '구약'], ['느헤미야', 13, '구약'],
  ['에스더', 10, '구약'], ['욥기', 42, '구약'], ['시편', 150, '구약'], ['잠언', 31, '구약'],
  ['전도서', 12, '구약'], ['아가', 8, '구약'], ['이사야', 66, '구약'], ['예레미야', 52, '구약'],
  ['예레미야애가', 5, '구약'], ['에스겔', 48, '구약'], ['다니엘', 12, '구약'], ['호세아', 14, '구약'],
  ['요엘', 3, '구약'], ['아모스', 9, '구약'], ['오바댜', 1, '구약'], ['요나', 4, '구약'],
  ['미가', 7, '구약'], ['나훔', 3, '구약'], ['하박국', 3, '구약'], ['스바냐', 3, '구약'],
  ['학개', 2, '구약'], ['스가랴', 14, '구약'], ['말라기', 4, '구약'],
  ['마태복음', 28, '신약'], ['마가복음', 16, '신약'], ['누가복음', 24, '신약'], ['요한복음', 21, '신약'],
  ['사도행전', 28, '신약'], ['로마서', 16, '신약'], ['고린도전서', 16, '신약'], ['고린도후서', 13, '신약'],
  ['갈라디아서', 6, '신약'], ['에베소서', 6, '신약'], ['빌립보서', 4, '신약'], ['골로새서', 4, '신약'],
  ['데살로니가전서', 5, '신약'], ['데살로니가후서', 3, '신약'], ['디모데전서', 6, '신약'], ['디모데후서', 4, '신약'],
  ['디도서', 3, '신약'], ['빌레몬서', 1, '신약'], ['히브리서', 13, '신약'], ['야고보서', 5, '신약'],
  ['베드로전서', 5, '신약'], ['베드로후서', 3, '신약'], ['요한일서', 5, '신약'], ['요한이서', 1, '신약'],
  ['요한삼서', 1, '신약'], ['유다서', 1, '신약'], ['요한계시록', 22, '신약']
];

export const BIBLE_BOOKS: ReadonlyArray<BibleBook> = RAW_BOOKS.map(([name, chapters, testament], index) => ({
  order: index + 1,
  name,
  chapters,
  testament
}));

export const BIBLE_TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

/** order(1-66) → 책. 1-based↔0-based 변환은 이 함수 한 곳에만 둔다 (D6). 범위 밖이면 undefined. */
export function getBookByOrder(order: number): BibleBook | undefined {
  return BIBLE_BOOKS[order - 1];
}

/** 해당 order 책의 chapter가 유효한 장 번호인지. 서버 액션의 장 범위 검증에 쓴다. */
export function isValidChapter(order: number, chapter: number): boolean {
  const book = getBookByOrder(order);
  return book !== undefined && Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters;
}
