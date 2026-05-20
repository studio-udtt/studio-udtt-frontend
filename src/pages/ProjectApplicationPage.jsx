import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProjectDetail } from "../api/user/projectApi";
import { createApplication } from "../api/user/applicationApi";

const initialForm = {
  applicant_name: "",
  applicant_phone: "",
  applicant_email: "",
  reason: "",
  job: "",
  sms_agreed: true,
};

export default function ProjectApplicationPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectDetail(projectId);
        setProject(response.data);
      } catch (error) {
        console.error("프로젝트 정보 조회 실패:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.applicant_name || !form.applicant_phone || !form.reason) {
      alert("이름, 연락처, 신청 사유는 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createApplication(projectId, form);

      alert(response.data.message || "참여 신청이 접수되었습니다.");
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("참여 신청 실패:", error);
      alert("참여 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="section">
      <div className="shell">
        <div className="application-layout">
          <section className="application-intro">
            <span className="eyebrow">APPLICATION</span>
            <h1 className="h-display">프로젝트 참여 신청</h1>

            {project ? (
              <div className="apply-project-card">
                <span className="region-tag">
                  {project.region_sido} · {project.region_sigungu}
                </span>
                <h2>{project.title}</h2>
                <p>{project.summary}</p>

                <div className="apply-meta">
                  <span>{project.project_type}</span>
                  <span>{project.space_size}</span>
                  <span>{project.status}</span>
                </div>
              </div>
            ) : (
              <p className="lead">프로젝트 정보를 불러오는 중입니다.</p>
            )}

            <Link to={`/projects/${projectId}`} className="apply-back">
              ← 프로젝트 상세로 돌아가기
            </Link>
          </section>

          <form className="form-card application-form" onSubmit={handleSubmit}>
            <h3>참여자 정보 입력</h3>
            <p className="sub">
              신청 내용을 확인한 뒤 운영팀이 승인 여부를 안내드립니다.
            </p>

            <div className="field-grid">
              <div className="field">
                <label>
                  이름 <span className="req">*</span>
                </label>
                <input
                  name="applicant_name"
                  value={form.applicant_name}
                  onChange={handleChange}
                  placeholder="한유진"
                />
              </div>

              <div className="field">
                <label>
                  연락처 <span className="req">*</span>
                </label>
                <input
                  name="applicant_phone"
                  value={form.applicant_phone}
                  onChange={handleChange}
                  placeholder="010-1111-2222"
                />
              </div>

              <div className="field full">
                <label>이메일</label>
                <input
                  name="applicant_email"
                  value={form.applicant_email}
                  onChange={handleChange}
                  placeholder="yujin@example.com"
                />
              </div>

              <div className="field full">
                <label>직업 / 역할</label>
                <input
                  name="job"
                  value={form.job}
                  onChange={handleChange}
                  placeholder="대학생, 디자이너, 목수, 기획자 등"
                />
              </div>

              <div className="field full">
                <label>
                  신청 사유 <span className="req">*</span>
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="이 프로젝트에 참여하고 싶은 이유를 적어주세요."
                />
              </div>

              <label className="agree-check full">
                <input
                  type="checkbox"
                  name="sms_agreed"
                  checked={form.sms_agreed}
                  onChange={handleChange}
                />
                문자 안내 수신에 동의합니다.
              </label>
            </div>

            <div className="form-submit">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "신청 중..." : "참여 신청하기 →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
