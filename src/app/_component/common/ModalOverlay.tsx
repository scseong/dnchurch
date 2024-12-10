type ModalOverlayProps = {
  isVisible: boolean;
  isDark?: boolean;
};

export default function ModalOverlay({ isVisible, isDark = true }: ModalOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return <div className={`${isDark ? 'overlay' : 'overlay-light'}`} />;
}
