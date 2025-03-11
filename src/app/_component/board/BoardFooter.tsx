import Link from 'next/link';
import { PiDownloadSimpleBold } from 'react-icons/pi';
import IconWrap from '../common/IconWrap';
import styles from './BoardFooter.module.scss';

export default function BoardFooter({
  files
}: {
  files: {
    filename: string;
    downloadPath: string;
  }[];
}) {
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
            <dd>이전글이 없습니다.</dd>
          </div>
          <div>
            <dt>다음글</dt>
            <dd>다음글이 없습니다.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
