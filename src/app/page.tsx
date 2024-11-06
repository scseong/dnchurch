/* eslint-disable @next/next/no-img-element */
import { getHomeBanner } from '@/apis/home';

export default async function Home() {
  const home_banner = await getHomeBanner();
  const { id, title, description, image_url, order, year } = home_banner[0];

  return (
    <div className="banner">
      <img src={image_url} alt={title} className="banner-image" />
      <div className="banner-content">
        <h3 className="banner-title">{title}</h3>
        <p className="banner-description">
          {description &&
            description.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
        </p>
      </div>
    </div>
  );
}
