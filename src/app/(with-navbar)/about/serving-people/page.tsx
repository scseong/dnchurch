import type { Metadata } from 'next';
import React from 'react';
import MainContainer from '@/components/layout/container/MainContainer';
import { getActiveStaff } from '@/apis/staff';
import type { StaffType } from '@/types/common';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '섬기는 이',
  description: '각 사역자들의 역할과 사역에 대한 정보를 확인해 보세요.',
  openGraph: {
    title: '섬기는 이',
    description: '각 사역자들의 역할과 사역에 대한 정보를 확인해 보세요.'
  }
};

export default async function ServingPeople() {
  const { data: staffList } = await getActiveStaff();

  return (
    <MainContainer title="섬기는 이">
      <div className={styles.wrap}>
        {(staffList ?? []).map((staff, idx) =>
          idx === 0 ? (
            <StaffProfile key={staff.id} staff={staff} />
          ) : (
            <React.Fragment key={staff.id}>
              <hr className={styles.divide} />
              <StaffProfile staff={staff} />
            </React.Fragment>
          )
        )}
      </div>
    </MainContainer>
  );
}

const StaffProfile = ({ staff }: { staff: StaffType }) => (
  <div className={styles.profile}>
    <div className={styles.title}>
      <h4>
        {staff.title} {staff.name}
      </h4>
    </div>
    <div className={styles.detail}>
      <div className={styles.image_wrap}>
        <img src={staff.image_url ?? ''} alt="프로필 이미지" />
      </div>
      <div className={styles.content}>
        {staff.education.length > 0 && (
          <div>
            <h5>학력</h5>
            <ul>
              {staff.education.map((edu, idx) => (
                <li key={idx}>{edu}</li>
              ))}
            </ul>
          </div>
        )}
        {staff.experience.length > 0 && (
          <div>
            <h5>약력</h5>
            <ul>
              {staff.experience.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          </div>
        )}
        {staff.contact && (
          <div>
            <h5>연락처</h5>
            <ul>
              <li>{staff.contact}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);
