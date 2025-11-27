import clsx from 'clsx';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import styles from './FormField.module.scss';

type Props = {
  id: string;
  label: string;
  type?: string;
  register: any;
  error?: string;
  placeholder?: string;
  blindLabel?: boolean;
  required?: boolean;
};

export default function FormField({
  id,
  label,
  type = 'text',
  register,
  error,
  placeholder,
  blindLabel = false,
  required = false
}: Props) {
  return (
    <div className={styles.input_group}>
      <label
        htmlFor={id}
        className={clsx(styles.label, {
          [styles.label_required]: required,
          [styles.label_blind]: blindLabel
        })}
      >
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} {...register} />
      {error && <FormAlertMessage type="error" message={error} />}
    </div>
  );
}
