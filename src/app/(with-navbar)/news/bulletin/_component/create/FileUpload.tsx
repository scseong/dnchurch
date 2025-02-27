import styles from './FileUpload.module.scss';

export default function FileUpload({
  onChange
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={styles.file_upload}>
      <input
        type="file"
        id="image_url"
        name="image_url"
        accept="image/*"
        onChange={onChange}
        multiple
        required
      />
      <span>이미지 가져오기</span>
    </div>
  );
}
