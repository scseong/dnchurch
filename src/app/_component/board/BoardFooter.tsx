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
    downloadUrl: string;
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
    <section>
      <div className={styles.file_attachment}>
        <dl>
          <div className={styles.group}>
            <dt>첨부파일</dt>
            <div>
              {files.map((file, idx) => (
                <dd key={`${file.filename}-${idx}`}>
                  <IconWrap Icon={PiDownloadSimpleBold} />
                  <Link href={file.downloadUrl} download={file.filename}>
                    {file.filename}
                  </Link>
                </dd>
              ))}
            </div>
          </div>
        </dl>
      </div>
      <nav className={styles.prev_next}>
        <dl>
          <div className={styles.group}>
            <dt>이전글</dt>
            <dd>
              {prev_title ? (
                <Link href={`/news/bulletin/${prev_id}`}>{prev_title}</Link>
              ) : (
                '이전글이 없습니다.'
              )}
            </dd>
          </div>
          <div className={styles.group}>
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
      </nav>
    </section>
  );
}
