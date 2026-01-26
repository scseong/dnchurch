import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>주보를 찾을 수 없습니다</h2>

      <p style={descriptionStyle}>
        입력하신 주소의 형식이 올바르지 않거나, <br />
        해당 주보가 이미 삭제되었을 수 있습니다.
      </p>

      <div style={buttonGroupStyle}>
        <Link href="/news/bulletin" style={primaryButtonStyle}>
          주보 목록으로 가기
        </Link>
        <Link href="/" style={secondaryButtonStyle}>
          홈페이지 메인
        </Link>
      </div>

      <p style={footerStyle}>문의사항이 있으시면 교회 사무실로 연락 주시기 바랍니다.</p>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: '20px',
  textAlign: 'center',
  fontFamily: 'inherit'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '16px'
};

const descriptionStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#666',
  marginBottom: '32px'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '12px'
};

const primaryButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#0070f3',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500'
};

const secondaryButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#f0f0f0',
  color: '#333',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '500'
};

const footerStyle = {
  marginTop: '48px',
  fontSize: '14px',
  color: '#999'
};
