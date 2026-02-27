import styles from './FormAlertMessage.module.scss';

type Props = {
  message?: string;
  type: 'error' | 'success';
};

export default function FormAlertMessage({ message, type }: Props) {
  if (!message) return;

  return (
    <div className={styles.alert_message}>
      <p role="alert" className={type === 'error' ? styles.error : styles.success}>
        {message}
      </p>
    </div>
  );
}
