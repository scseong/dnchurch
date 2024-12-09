type UserProfileModalProps = {
  isVisible: boolean;
  onClose: () => void;
  user: {
    avatarUrl: string;
    name: string;
    username: string;
  };
};

export default function UserProfileModal({}: UserProfileModalProps) {
  return <div>UserProfileModal</div>;
}
