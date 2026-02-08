import styles from './BoardBody.module.scss';

export default function BoardBody({ images }: { images: string[] }) {
  return (
    <div className={styles.body}>
      {images.map((url) => (
        <div key={url}>
          <img src={url} alt={url} />
        </div>
      ))}
    </div>
  );
}
