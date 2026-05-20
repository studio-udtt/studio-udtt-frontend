import { Link } from "react-router-dom";

export default function AdminNotFoundPage() {
  return (
    <section className="admin-page">
      <div className="admin-not-found-card">
        <span>ADMIN 404</span>
        <h1>관리자 페이지를 찾을 수 없습니다.</h1>
        <p>요청한 관리자 메뉴가 존재하지 않습니다.</p>

        <Link to="/admin" className="admin-save-btn">
          대시보드로 이동
        </Link>
      </div>
    </section>
  );
}
