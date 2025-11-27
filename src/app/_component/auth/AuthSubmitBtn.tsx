import Loader from '@/app/_component/common/Loader';
import styles from './AuthSubmitBtn.module.scss';

type Props = {
  isDisabled: boolean;
  isSubmitting: boolean;
  label: string;
};

export default function AuthSubmitBtn({ isDisabled, isSubmitting, label }: Props) {
  return (
    <button
      className={isDisabled ? styles.disabled_button : styles.active_button}
      disabled={isDisabled || isSubmitting}
    >
      {isSubmitting ? <Loader /> : label}
    </button>
  );
}
