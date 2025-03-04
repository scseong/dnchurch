import { IconType } from 'react-icons';

export default function IconWrap({ Icon }: { Icon: IconType }) {
  return (
    <i style={{ display: 'inline-flex' }}>
      <Icon />
    </i>
  );
}
