import styles from './WorshipSchedule.module.scss';

const WorshipSchedule = () => {
  const churchData = [
    { worship: '새벽기도회', time: '매일 오전 05:30', location: '소예배실' },
    { worship: '주일낮예배', time: '오전 11:00', location: '대예배실' },
    { worship: '주일저녁예배', time: '오후 06:00', location: '대예배실' },
    { worship: '수요기도회', time: '오후 07:00', location: '대예배실' },
    { worship: '금요기도회', time: '오후 08:00', location: '대예배실' }
  ];

  const sundaySchoolData = [
    { worship: '유치부', time: '오전 09:00', location: '소예배실' },
    { worship: '초등부', time: '오전 09:00', location: '교육관 유초등부실' },
    { worship: '중고등부', time: '오전 09:00', location: '대예배실' },
    { worship: '청년부', time: '오후 01:30', location: '대예배실' }
  ];

  return (
    <div className={styles.worship_schedule}>
      <table className={styles.table}>
        <colgroup>
          <col width="40%" />
          <col width="35%" />
          <col width="25%" />
        </colgroup>
        <thead>
          <tr>
            <th>예배</th>
            <th>시간</th>
            <th>장소</th>
          </tr>
        </thead>
        <tbody>
          {churchData.map((item, index) => (
            <tr key={index}>
              <td>{item.worship}</td>
              <td>{item.time}</td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className={styles.table}>
        <colgroup>
          <col width="40%" />
          <col width="35%" />
          <col width="25%" />
        </colgroup>
        <thead>
          <tr>
            <th>주일학교</th>
            <th>시간</th>
            <th>장소</th>
          </tr>
        </thead>
        <tbody>
          {sundaySchoolData.map((item, index) => (
            <tr key={index}>
              <td>{item.worship}</td>
              <td>{item.time}</td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorshipSchedule;
