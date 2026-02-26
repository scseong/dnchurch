import Loader from '@/components/common/Loader';
import styles from './FormSubmitButton.module.scss';

type Props = {
  isDisabled: boolean;
  isSubmitting: boolean;
  label: string;
};

export default function FormSubmitButton({ isDisabled, isSubmitting, label }: Props) {
  return (
    <button
      className={isDisabled ? styles.disabled_button : styles.active_button}
      disabled={isDisabled || isSubmitting}
    >
      {isSubmitting ? <Loader /> : label}
    </button>
  );
}
