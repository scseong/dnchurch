type IconContainerProps = {
  children: React.ReactNode;
};

export default function IconContainer({ children }: IconContainerProps) {
  return <i style={{ display: 'inline-flex' }}>{children}</i>;
}
