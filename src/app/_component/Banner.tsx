import ImageSlider from './ImageSlider';

export default async function Banner() {
  // TODO: supabase API 연결
  const data = [
    {
      id: 1,
      title: '서로서로 세워가는 교회',
      description: '1. 예배로\n2. 믿음과 행함으로\n3. 전도로',
      order: 1,
      image_url:
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/sign/home_banner/church-4911852_1920.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJob21lX2Jhbm5lci9jaHVyY2gtNDkxMTg1Ml8xOTIwLmpwZyIsImlhdCI6MTczMDgyMzA0NiwiZXhwIjoxNzYyMzU5MDQ2fQ.m7XETfrk2JgqxLeM5uJ-UzISeMX3iNLDWOGng_4Ga-g&t=2024-11-05T16%3A10%3A46.164Z',
      year: 2024
    },
    {
      id: 2,
      title: '차별금지법 반대 연합예배',
      description: null,
      order: 2,
      image_url:
        'https://ndimreqwgdiwtjonjjzq.supabase.co/storage/v1/object/sign/home_banner/anti.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJob21lX2Jhbm5lci9hbnRpLmpwZyIsImlhdCI6MTczMDk5NjAzMSwiZXhwIjoxNzYyNTMyMDMxfQ.ytJtbJQETOAtt3VCgHjCbytGFAbGPksYRAb-nKSN2O8&t=2024-11-07T16%3A13%3A51.617Z',
      year: 2024
    }
  ];

  return <ImageSlider homeBanners={data} />;
}
