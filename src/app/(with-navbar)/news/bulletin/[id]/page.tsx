import { getBulletinsById } from '@/apis/bulletin';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { formattedDate } from '@/shared/util/date';
import { PiDownloadSimpleBold } from 'react-icons/pi';
import IconWrap from '@/app/_component/common/IconWrap';
import { getFilenameFromUrl } from '@/shared/util/file';

export default async function BulletinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: bulletinId } = await params;
  const bulletin = await getBulletinsById(bulletinId);

  if (!bulletin) notFound();

  const { created_at, image_url, title, user_id, profiles } = bulletin;

  return (
    <MainContainer title="주보">
      <div className={styles.top}>
        <div className={styles.title}>
          <h4>{title}</h4>
        </div>
        <div className={styles.info}>
          <div className={styles.left}>
            <dl>
              <dt>작성자</dt>
              <dd>{profiles.user_name}</dd>
            </dl>
            <dl>
              <dt>등록일</dt>
              <dd>{formattedDate(created_at, 'YY.MM.DD')}</dd>
            </dl>
          </div>
          <div className={styles.right}>
            <ul>
              <li>삭제</li>
              <li>수정</li>
              <li>공유</li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.mid}>
        {image_url.map((url) => (
          <div key={url} className={styles.image_wrap}>
            <img src={url} alt={url} />
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <div className={styles.file_attachment}>
          <dl>
            <dt>첨부파일</dt>
            <div className={styles.download}>
              {image_url.map((url, idx) => (
                <dd key={idx}>
                  <IconWrap Icon={PiDownloadSimpleBold} />
                  <a href={url} download>
                    {getFilenameFromUrl(url)}
                  </a>
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
    </MainContainer>
  );
}
