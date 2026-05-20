import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <span>404</span>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>요청하신 주소가 잘못되었거나, 페이지가 이동되었을 수 있습니다.</p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            메인으로 돌아가기
          </Link>

          <Link to="/recruit" className="btn btn-ghost">
            모집 페이지 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
