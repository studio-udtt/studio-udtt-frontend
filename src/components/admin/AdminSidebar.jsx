import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { adminLogout, getCurrentAdmin } from "../../api/admin/adminAuthApi";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const response = await getCurrentAdmin();

        setAdminName(response.data.name || response.data.login_id || "관리자");

        localStorage.setItem("admin", JSON.stringify(response.data));
      } catch (error) {
        console.error("현재 로그인 관리자 조회 실패:", error);

        const savedAdmin = localStorage.getItem("admin");

        if (savedAdmin) {
          try {
            const parsedAdmin = JSON.parse(savedAdmin);
            setAdminName(parsedAdmin.name || parsedAdmin.login_id || "관리자");
          } catch {
            setAdminName("관리자");
          }
        } else {
          setAdminName("관리자");
        }
      }
    };

    fetchCurrentAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("관리자 로그아웃 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("admin");
      navigate("/admin/login");
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand admin-brand-home">
        <div className="admin-brand-text">
          <span className="admin-brand-label">현재 로그인 관리자</span>
          <strong className="admin-brand-name">
            {adminName}
            <small> 님</small>
          </strong>
        </div>

        <Link to="/" className="admin-home-btn" title="웹사이트 홈으로 이동">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 10.8L12 3L21 10.8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 10.5V20H18.5V10.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 20V14H14.5V20"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          대시보드
        </NavLink>

        <NavLink
          to="/admin/requests"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          신청 관리
        </NavLink>

        <NavLink
          to="/admin/projects"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          프로젝트 관리
        </NavLink>

        <NavLink
          to="/admin/contents"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          콘텐츠 관리
        </NavLink>

        <NavLink
          to="/admin/sms"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          문자 발송
        </NavLink>

        <NavLink
          to="/admin/survey"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          설문 관리
        </NavLink>
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        로그아웃
      </button>
    </aside>
  );
}
