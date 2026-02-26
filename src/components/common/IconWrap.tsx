import { IconType, IconBaseProps } from 'react-icons';

export default function IconWrap({ Icon, svgProps }: { Icon: IconType; svgProps?: IconBaseProps }) {
  return (
    <i style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Icon {...svgProps} />
    </i>
  );
}
