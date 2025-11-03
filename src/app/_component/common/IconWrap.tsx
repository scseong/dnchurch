import { IconType, IconBaseProps } from 'react-icons';

export default function IconWrap({ Icon, svgProps }: { Icon: IconType; svgProps?: IconBaseProps }) {
  return (
    <i style={{ display: 'flex' }}>
      <Icon {...svgProps} />
    </i>
  );
}
