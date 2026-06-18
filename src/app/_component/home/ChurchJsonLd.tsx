import { CHURCH_INFO } from '@/config/seo';
import { getChurchIdentityData } from '@/services/about';
import { parseFiniteFloat } from '@/utils/site-settings';

// site_settings.value가 미시드('TODO'/'TODO:' prefix)·빈 문자열·null이면 구조화 데이터에서 뺀다.
// displaySettingValue는 '준비 중' fallback을 돌려주므로 JSON-LD엔 쓰지 않는다 — placeholder가 telephone에 박히면 안 된다.
const cleanValue = (value: string | null | undefined): string | null => {
  if (!value || value === 'TODO' || value.startsWith('TODO:')) return null;
  return value;
};

// 순수 빌더 — fetch한 settings를 JSON-LD 객체로 바꾼다(I/O 없음). sermons buildJsonLd와 같은 패턴.
function generateChurchJsonLd(settings: Record<string, string>, siteUrl: string | undefined) {
  const zipcode = cleanValue(settings.church_zipcode);

  // 주소는 CHURCH_INFO 상수로 고정한다. PostalAddress는 streetAddress·addressLocality·addressRegion 구조 분해가
  // 필요한데 site_settings.church_address는 자유형 문자열 1개라 안정적으로 못 나눈다. 교회 물리 주소는 안 바뀌는 값이라
  // 상수가 맞고, 주소가 바뀌면 이 상수를 직접 갱신한다(의사결정 로그 D1 참조). 우편번호만 DB에서 받는다.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Church', 'Organization'],
    name: CHURCH_INFO.name,
    legalName: CHURCH_INFO.legalName,
    address: {
      '@type': 'PostalAddress',
      ...CHURCH_INFO.address,
      ...(zipcode ? { postalCode: zipcode } : {})
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: parseFiniteFloat(settings.church_lat, CHURCH_INFO.geo.latitude),
      longitude: parseFiniteFloat(settings.church_lng, CHURCH_INFO.geo.longitude)
    }
  };

  const telephone = cleanValue(settings.church_phone);
  if (telephone) jsonLd.telephone = telephone;

  const email = cleanValue(settings.church_email);
  if (email) jsonLd.email = email;

  // 절대 URL은 NEXT_PUBLIC_SITE_URL이 있을 때만 — og:url 처리와 같은 정책(미설정 빌드에서 깨진 절대경로를 안 내보낸다).
  // 끝 슬래시를 떼어 `${siteUrl}/images/...`가 '//images'로 겹치는 것을 막는다.
  if (siteUrl) {
    const base = siteUrl.replace(/\/$/, '');
    jsonLd['@id'] = base;
    jsonLd.url = base;
    jsonLd.image = `${base}${CHURCH_INFO.image}`;
  }

  return jsonLd;
}

export default async function ChurchJsonLd() {
  const { settings } = await getChurchIdentityData();
  const jsonLd = generateChurchJsonLd(settings, process.env.NEXT_PUBLIC_SITE_URL);

  // JSON 내 '<'를 <로 이스케이프 — DB 값에 '</script>'가 섞여도 태그 탈출(XSS)을 막는다.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
