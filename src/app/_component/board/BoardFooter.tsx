import Link from 'next/link';
import { PiDownloadSimpleBold } from 'react-icons/pi';
import IconWrap from '../common/IconWrap';
import styles from './BoardFooter.module.scss';

export default function BoardFooter({
  files,
  prevNext
}: {
  files: {
    filename: string;
    downloadPath: string;
  }[];
  prevNext: {
    prev_id: number;
    prev_title: string;
    next_id: number;
    next_title: string;
  } | null;
}) {
  const { prev_id, prev_title, next_id, next_title } = prevNext || {};

  return (
    <div>
      <div className={styles.file_attachment}>
        <dl>
          <dt>첨부파일</dt>
          <div className={styles.download}>
            {files.map((file, idx) => (
              <dd key={idx}>
                <IconWrap Icon={PiDownloadSimpleBold} />
                <Link href={file.downloadPath} download>
                  {file.filename}
                </Link>
              </dd>
            ))}
          </div>
        </dl>
      </div>
      <div className={styles.prev_next}>
        <dl>
          <div>
            <dt>이전글</dt>
            <dd>
              {prev_title ? (
                <Link href={`/news/bulletin/${prev_id}`}>{prev_title}</Link>
              ) : (
                '이전글이 없습니다.'
              )}
            </dd>
          </div>
          <div>
            <dt>다음글</dt>
            <dd>
              {next_title ? (
                <Link href={`/news/bulletin/${next_id}`}>{next_title}</Link>
              ) : (
                '다음글이 없습니다.'
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
