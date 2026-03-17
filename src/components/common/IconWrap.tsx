import { IconType, IconBaseProps } from 'react-icons';

export default function IconWrap({
  Icon,
  svgProps,
  className,
  ...rest
}: {
  Icon: IconType;
  svgProps?: IconBaseProps;
  className?: string;
}) {
  return (
    <i style={{ display: 'inline-flex', alignItems: 'center' }} className={className} {...rest}>
      <Icon {...svgProps} />
    </i>
  );
}
