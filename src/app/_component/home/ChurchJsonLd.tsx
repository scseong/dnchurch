import { CHURCH_INFO } from '@/config/seo';
import { getChurchIdentityData } from '@/services/about';
import { parseFiniteFloat } from '@/utils/site-settings';

// site_settings.value가 미시드('TODO'/'TODO:' prefix)·빈 문자열이면 구조화 데이터에서 뺀다.
// displaySettingValue는 '준비 중' fallback을 돌려주므로 JSON-LD엔 쓰지 않는다 — placeholder가 telephone에 박히면 안 된다.
const cleanValue = (value: string | undefined): string | null => {
  if (!value || value === 'TODO' || value.startsWith('TODO:')) return null;
  return value;
};

async function buildChurchJsonLd() {
  const { settings } = await getChurchIdentityData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const zipcode = cleanValue(settings.church_zipcode);

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
  if (siteUrl) {
    jsonLd['@id'] = siteUrl;
    jsonLd.url = siteUrl;
    jsonLd.image = `${siteUrl}${CHURCH_INFO.image}`;
  }

  return jsonLd;
}

export default async function ChurchJsonLd() {
  const jsonLd = await buildChurchJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
