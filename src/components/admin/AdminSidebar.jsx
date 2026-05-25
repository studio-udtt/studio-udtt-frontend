import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
      <div className="admin-brand">
        <span>현재 로그인 관리자</span>
        <strong>
          {adminName}
          <small> 님</small>
        </strong>
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
