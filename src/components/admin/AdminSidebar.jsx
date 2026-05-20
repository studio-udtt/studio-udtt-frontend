import { NavLink, useNavigate } from "react-router-dom";
import { adminLogout } from "../../api/admin/adminAuthApi";

export default function AdminSidebar() {
  const navigate = useNavigate();

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
      <div className="admin-brand">
        <span>studio&amp;lab</span>
        <strong>우당탕탕 관리자</strong>
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
          to="/admin/stats"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          통계 관리
        </NavLink>
      </nav>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        로그아웃
      </button>
    </aside>
  );
}
