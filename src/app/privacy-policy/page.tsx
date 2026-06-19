import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import styles from './page.module.scss';

const EFFECTIVE_DATE = '2026년 7월 1일';
const ANNOUNCED_DATE = '2026년 6월 24일';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '대구동남교회의 개인정보 수집·이용·처리위탁·보관에 관한 방침을 안내합니다.',
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '개인정보처리방침',
    description: '대구동남교회의 개인정보 수집·이용·처리위탁·보관에 관한 방침을 안내합니다.'
  }
};

export default function PrivacyPolicy() {
  return (
    <section id="privacy-policy">
      <LayoutContainer>
        <div className={styles.wrap}>
          <header className={styles.header}>
            <h1>개인정보처리방침</h1>
            <p>시행일: {EFFECTIVE_DATE}</p>
          </header>

          <p className={styles.notice} role="note">
            본 개인정보처리방침은 개인정보보호법 표준 양식을 기반으로 작성한 초안입니다. 실제
            서비스 운영을 시작하기 전에 (1) 회원가입 시 민감정보·국외 이전에 대한 별도 동의
            절차를 마련하고, (2) 개인정보보호법 전문가의 검토를 받을 필요가 있습니다.
          </p>

          <article className={styles.policy}>
            <p className={styles.intro}>
              대구동남교회(이하 &lsquo;교회&rsquo;)는 정보주체의 개인정보를 소중히 여기며,
              개인정보보호법을 비롯한 관련 법령을 준수합니다. 교회는 아래와 같이 개인정보를
              수집·이용·보관하며, 그 처리 방침을 본 문서로 공개합니다.
            </p>

            <section className={styles.section}>
              <h2>1. 수집하는 개인정보 항목 및 수집 방법</h2>
              <p>교회는 회원가입과 서비스 이용 과정에서 아래 개인정보를 수집합니다.</p>
              <ul>
                <li>
                  <strong>회원가입(필수)</strong>: 이메일 주소, 비밀번호, 이름, 프로필명
                </li>
                <li>
                  <strong>카카오 로그인 이용 시</strong>: 카카오계정 이메일, 닉네임, 프로필 이미지
                </li>
                <li>
                  <strong>프로필 입력(선택)</strong>: 전화번호, 프로필 사진, 소속 부서·사역 정보
                </li>
                <li>
                  <strong>서비스 이용 중 자동 생성·수집</strong>: 접속 일시·기록, 기기·브라우저
                  정보, 로그인 상태 유지를 위한 쿠키
                </li>
              </ul>
              <p>
                게시판·커뮤니티에 글을 작성하면 작성자명으로 회원의 프로필명이 다른 이용자에게
                공개될 수 있습니다.
              </p>
              <p className={styles.sub}>
                수집 방법: 회원가입·프로필 입력 화면에서의 직접 입력, 카카오 소셜 로그인 연동,
                서비스 이용 과정에서의 자동 수집
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. 개인정보의 처리 목적</h2>
              <ul>
                <li>회원 식별·가입 의사 확인·계정 관리</li>
                <li>예배·교회 소식·공지 안내</li>
                <li>주보·설교 등 콘텐츠 제공과 커뮤니티·게시판 운영</li>
                <li>문의 응대 및 민원 처리</li>
                <li>서비스 이용 현황 파악과 서비스 개선</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. 개인정보의 보유 및 이용 기간</h2>
              <p>
                교회는 원칙적으로 회원 탈퇴 시 개인정보를 지체 없이 파기합니다. 다만 관계 법령에
                따라 보존할 의무가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. 개인정보의 제3자 제공</h2>
              <p>
                교회는 정보주체의 개인정보를 제2조의 목적 범위를 넘어 제3자에게 제공하지 않습니다.
                다만 법령에 특별한 규정이 있거나 수사기관이 적법한 절차에 따라 요청하는 경우에는
                예외로 합니다. (개인정보의 처리위탁·국외 이전은 제5조·제6조에서 별도로 안내합니다.)
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. 개인정보 처리의 위탁</h2>
              <p>교회는 서비스 운영을 위해 아래와 같이 개인정보 처리 업무를 위탁합니다.</p>
              <div className={styles.table_wrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">수탁자</th>
                      <th scope="col">위탁 업무</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Supabase Inc.</td>
                      <td>회원 데이터베이스 운영, 로그인·인증 처리</td>
                    </tr>
                    <tr>
                      <td>Cloudinary Ltd.</td>
                      <td>주보·프로필 등 이미지 저장 및 전송</td>
                    </tr>
                    <tr>
                      <td>Vercel Inc.</td>
                      <td>웹사이트 호스팅 및 서버 기능 제공</td>
                    </tr>
                    <tr>
                      <td>(주)카카오</td>
                      <td>카카오 로그인 인증, 지도 서비스, 콘텐츠 공유 기능</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.section}>
              <h2>6. 개인정보의 국외 이전</h2>
              <p>
                아래 수탁사는 국외에 본사를 두고 있어, 서비스 제공 과정에서 개인정보가 국외로
                이전됩니다. 이는 회원 서비스 제공에 필요한 처리위탁·보관 목적의 이전으로,
                개인정보보호법 제28조의8 제1항에 따라 본 처리방침 공개로 안내합니다. 해당 이전은
                서비스 제공에 필수적이므로, 이를 원하지 않을 경우 회원 서비스 이용이 제한될 수
                있습니다.
              </p>
              <div className={styles.table_wrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">이전받는 자</th>
                      <th scope="col">이전 항목</th>
                      <th scope="col">이전 국가</th>
                      <th scope="col">이전 일시·방법</th>
                      <th scope="col">이용 목적</th>
                      <th scope="col">보유·이용 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Supabase Inc.</td>
                      <td>회원 가입·프로필·게시물 정보</td>
                      <td>미국 (데이터 저장: 대한민국 서울 리전)</td>
                      <td>서비스 이용 시점에 네트워크를 통한 전송</td>
                      <td>회원 데이터베이스·인증 운영</td>
                      <td>회원 탈퇴 또는 위탁계약 종료 시까지</td>
                    </tr>
                    <tr>
                      <td>Cloudinary Ltd.</td>
                      <td>이용자가 업로드한 이미지</td>
                      <td>미국</td>
                      <td>이미지 업로드 시점에 네트워크를 통한 전송</td>
                      <td>이미지 저장·전송</td>
                      <td>회원 탈퇴 또는 위탁계약 종료 시까지</td>
                    </tr>
                    <tr>
                      <td>Vercel Inc.</td>
                      <td>서비스 이용 과정에서 처리되는 개인정보</td>
                      <td>미국</td>
                      <td>페이지·기능 요청 시점에 네트워크를 통한 전송</td>
                      <td>웹사이트 호스팅·서버 기능 제공</td>
                      <td>회원 탈퇴 또는 위탁계약 종료 시까지</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.sub}>
                각 수탁사의 개인정보 보호 연락처는 해당 사업자 웹사이트에 게시된 개인정보처리방침에서
                확인할 수 있습니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. 만 14세 미만 아동의 개인정보 처리</h2>
              <p>
                교회는 만 14세 미만 아동의 회원가입을 원칙적으로 받지 않습니다. 만 14세 미만
                아동의 개인정보가 법정대리인의 동의 없이 수집된 사실이 확인되면 지체 없이
                파기합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. 정보주체와 법정대리인의 권리·의무 및 행사 방법</h2>
              <p>정보주체와 법정대리인은 언제든지 아래 권리를 행사할 수 있습니다.</p>
              <ul>
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
                <li>수집·이용 동의의 철회</li>
              </ul>
              <p>
                권리 행사는 제11조의 개인정보 보호책임자에게 서면·전화·이메일로 요청할 수 있으며,
                교회는 지체 없이 조치합니다. 열람 청구는 사무국에서 접수·처리합니다.
              </p>
              <p className={styles.sub}>
                동의 거부 권리: 정보주체는 개인정보 수집·이용 동의를 거부할 수 있습니다. 다만
                회원가입에 필요한 필수 항목의 동의를 거부하면 회원가입이 제한되며, 선택 항목(전화번호
                등)의 동의를 거부하더라도 서비스 이용에는 제한이 없습니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. 민감정보의 처리</h2>
              <p>
                교회 회원 여부, 소속 부서·사역 정보는 정보주체의 종교적 신념과 관련된 민감정보
                (개인정보보호법 제23조)에 해당할 수 있습니다. 교회는 이러한 정보를 신앙 공동체
                운영과 교적 관리 목적으로, 정보주체의 별도 동의를 받아 처리합니다. 정보주체는 이
                동의를 거부할 수 있으며, 거부 시 해당 정보가 필요한 일부 서비스 이용이 제한될 수
                있습니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. 개인정보의 파기 절차 및 방법</h2>
              <p>
                보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적
                파일은 복구·재생이 불가능한 방법으로 삭제하고, 출력물 등은 분쇄하거나 소각합니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. 개인정보 자동 수집 장치(쿠키)의 운영</h2>
              <p>
                교회는 로그인 상태 유지를 위해 쿠키를 사용합니다. 정보주체는 브라우저 설정에서
                쿠키 저장을 거부할 수 있으며, 거부 시 로그인 유지 등 일부 기능이 제한될 수
                있습니다. 교회는 별도의 분석·광고 추적 도구(예: Google Analytics)를 사용하지
                않습니다.
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. 개인정보의 안전성 확보 조치</h2>
              <ul>
                <li>비밀번호 등 인증 정보의 암호화 저장</li>
                <li>개인정보 접근 권한의 최소화 및 접근 통제</li>
                <li>접속 기록의 보관·관리</li>
                <li>HTTPS 보안 통신을 통한 전송 구간 보호</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>13. 해당 없는 처리 사항</h2>
              <p>본 처리방침 작성 시점에 교회는 아래 사항을 처리하지 않습니다.</p>
              <ul>
                <li>수집 목적의 범위를 벗어난 개인정보의 추가적인 이용·제공</li>
                <li>자동화된 결정(프로파일링)에 의한 개인정보 처리</li>
                <li>가명정보의 처리</li>
                <li>영상정보처리기기(CCTV)를 통한 개인영상정보 처리</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>14. 개인정보 보호책임자 및 권익 침해 구제</h2>
              <p>
                교회는 개인정보 처리에 관한 업무를 총괄하고 정보주체의 문의·불만을 처리하기 위해
                아래와 같이 개인정보 보호책임자를 지정합니다.
              </p>
              <ul className={styles.contact}>
                <li>개인정보 보호책임자: 대구동남교회 사무국</li>
                <li>
                  연락처: 053-552-3403 /{' '}
                  <a href="mailto:purityk@hanmail.net">purityk@hanmail.net</a>
                </li>
                <li>열람 청구 접수·처리 부서: 사무국 (위 연락처)</li>
              </ul>
              <p>
                개인정보 침해로 인한 상담·신고는 아래 기관에 문의할 수 있습니다.
              </p>
              <ul>
                <li>개인정보분쟁조정위원회: (국번 없이) 1833-6972</li>
                <li>개인정보침해신고센터: (국번 없이) 118</li>
                <li>대검찰청 사이버수사과: (국번 없이) 1301</li>
                <li>경찰청 사이버수사국: (국번 없이) 182</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>15. 개인정보처리방침의 변경</h2>
              <p>
                본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 개정 시 시행 7일 전부터
                공지사항을 통해 고지합니다.
              </p>
              <ul>
                <li>공고일: {ANNOUNCED_DATE}</li>
                <li>시행일: {EFFECTIVE_DATE}</li>
              </ul>
            </section>
          </article>
        </div>
      </LayoutContainer>
    </section>
  );
}
