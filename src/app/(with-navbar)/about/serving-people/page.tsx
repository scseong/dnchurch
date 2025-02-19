import React from 'react';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import styles from './page.module.scss';

const pastorProfile = [
  {
    name: '김성규',
    title: '담임목사',
    image: '/images/senior-profile-image.jpg',
    education: ['합동신학대학원대학교 졸업'],
    experience: ['합신 총동문회장'],
    contact: 'purityk@hanmail.net'
  },
  {
    name: '박지권',
    title: '교육목사',
    image: '/images/assistant-profile-image.jpg',
    education: ['합동신학대학원대학교 졸업'],
    experience: ['대구 DFC 대표'],
    contact: 'gwon56@naver.com'
  }
];

export default function ServingPeople() {
  return (
    <MainContainer title="섬기는 이">
      <div className={styles.wrap}>
        {pastorProfile.map((profile, idx) =>
          idx === 0 ? (
            <PastorProfile key={profile.name + idx} profile={profile} />
          ) : (
            <React.Fragment key={profile.name + idx}>
              <div className={styles.divide} />
              <PastorProfile profile={profile} />
            </React.Fragment>
          )
        )}
      </div>
    </MainContainer>
  );
}

const PastorProfile = ({ profile }: { profile: (typeof pastorProfile)[0] }) => (
  <div className={styles.profile}>
    <div className={styles.title}>
      <h4>
        {profile.title} {profile.name}
      </h4>
    </div>
    <div className={styles.detail}>
      <div className={styles.image_wrap}>
        <img src={profile.image} alt="프로필 이미지" />
      </div>
      <div className={styles.content}>
        <div>
          <h5>학력</h5>
          <ul>
            {profile.education.map((edu, idx) => (
              <li key={idx}>{edu}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>약력</h5>
          <ul>
            {profile.experience.map((exp, idx) => (
              <li key={idx}>{exp}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>연락처</h5>
          <ul>
            <li>{profile.contact}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);
