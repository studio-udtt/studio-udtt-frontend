import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/admin/adminAuthApi";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    login_id: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.login_id || !form.password) {
      alert("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await adminLogin(form);

      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("admin", JSON.stringify(response.data.admin));

      navigate("/admin");
    } catch (error) {
      console.error("관리자 로그인 실패:", error);
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-head">
          <span>ADMIN</span>
          <h1>우당탕탕 관리자 로그인</h1>
          <p>프로젝트, 신청, 콘텐츠, 문자 발송을 관리합니다.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>아이디</label>
            <input
              name="login_id"
              value={form.login_id}
              onChange={handleChange}
              placeholder="admin"
            />
          </div>

          <div className="admin-field">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}
