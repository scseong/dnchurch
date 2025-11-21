import styles from './FormErrorMessage.module.scss';

type Props = {
  message?: string;
};

export default function FormErrorMessage({ message }: Props) {
  if (!message) return;

  return (
    <div className={styles.alert_message}>
      <p role="alert">{message}</p>
    </div>
  );
}
