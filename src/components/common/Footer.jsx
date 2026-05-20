import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="brand-block">
          <Link to="/" className="logo">
            <span className="pre">studio&amp;lab</span>
            <span className="name">
              우당탕탕<span className="dot">.</span>
            </span>
          </Link>

          <p>
            지역의 빈 공간과 사람을 연결해 함께 고치고, 만들고, 운영하는 DIT
            기반 공간 프로젝트 플랫폼입니다.
          </p>
        </div>

        <div className="footer-col">
          <h5>서비스</h5>
          <ul>
            <li>
              <Link to="/">프로젝트 지도</Link>
            </li>
            <li>
              <Link to="/recruit">참여 모집</Link>
            </li>
            <li>
              <Link to="/recruit">프로젝트 의뢰</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>우당탕탕</h5>
          <ul>
            <li>
              <Link to="/about">회사 소개</Link>
            </li>
            <li>
              <Link to="/about">콘텐츠</Link>
            </li>
            <li>
              <Link to="/about">누적 데이터</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>관리</h5>
          <ul>
            <li>
              <Link to="/admin/login">관리자 로그인</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 studio&amp;lab 우당탕탕. All rights reserved.</p>

        <div className="sns">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            YouTube
          </a>
          <a href="mailto:contact@udtt.studio">Contact</a>
        </div>
      </div>
    </footer>
  );
}
