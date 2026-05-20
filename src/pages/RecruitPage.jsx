import { useEffect, useState } from "react";
import { getProjects } from "../api/user/projectApi";
import { createProjectRequest } from "../api/user/requestApi";
import ProjectCard from "../components/project/ProjectCard";

const initialForm = {
  requester_name: "",
  requester_phone: "",
  requester_email: "",
  sms_agreed: true,
  space_address: "",
  region_sido: "서울특별시",
  region_sigungu: "",
  project_type: "공간 재생",
  space_size: "",
  desired_start_date: "",
  description: "",
};

export default function RecruitPage() {
  const [activeTab, setActiveTab] = useState("request");
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecruitingProjects = async () => {
      try {
        const response = await getProjects({
          status: "RECRUITING",
        });

        setProjects(response.data);
      } catch (error) {
        console.error("모집 프로젝트 조회 실패:", error);
        setProjects([]);
      }
    };

    fetchRecruitingProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProjectTypeChange = (projectType) => {
    setForm((prev) => ({
      ...prev,
      project_type: projectType,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.requester_name || !form.requester_phone || !form.space_address) {
      alert("이름, 연락처, 공간 주소는 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createProjectRequest(form);

      alert(response.data.message || "프로젝트 의뢰가 접수되었습니다.");
      setForm(initialForm);
    } catch (error) {
      console.error("프로젝트 의뢰 실패:", error);
      alert("의뢰 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="section">
      <div className="shell">
        <div className="page-head">
          <span className="eyebrow">REQUEST / RECRUIT</span>
          <h1 className="h-display">
            함께 만들 공간을 의뢰하고,
            <br />
            함께 만들 프로젝트에 참여하세요.
          </h1>
          <p className="lead">
            빈 공간을 바꾸고 싶은 의뢰자와 직접 만들기에 참여하고 싶은 사람들을
            연결합니다.
          </p>
        </div>

        <div className="toggle-wrap">
          <div className="toggle">
            <button
              type="button"
              className={activeTab === "request" ? "on" : ""}
              onClick={() => setActiveTab("request")}
            >
              의뢰하기
            </button>
            <button
              type="button"
              className={activeTab === "join" ? "on" : ""}
              onClick={() => setActiveTab("join")}
            >
              참여 모집
            </button>
          </div>
        </div>

        {activeTab === "request" && (
          <section className="recruit-layout">
            <form className="form-card" onSubmit={handleSubmit}>
              <h3>프로젝트 의뢰하기</h3>
              <p className="sub">
                공간 정보와 원하는 방향을 남겨주시면 운영팀이 확인 후
                연락드립니다.
              </p>

              <div className="field-grid">
                <div className="field">
                  <label>
                    이름 <span className="req">*</span>
                  </label>
                  <input
                    name="requester_name"
                    value={form.requester_name}
                    onChange={handleChange}
                    placeholder="김도윤"
                  />
                </div>

                <div className="field">
                  <label>
                    연락처 <span className="req">*</span>
                  </label>
                  <input
                    name="requester_phone"
                    value={form.requester_phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="field full">
                  <label>이메일</label>
                  <input
                    name="requester_email"
                    value={form.requester_email}
                    onChange={handleChange}
                    placeholder="doyoon@example.com"
                  />
                </div>

                <div className="field">
                  <label>
                    시/도 <span className="req">*</span>
                  </label>
                  <input
                    name="region_sido"
                    value={form.region_sido}
                    onChange={handleChange}
                    placeholder="서울특별시"
                  />
                </div>

                <div className="field">
                  <label>
                    시/군/구 <span className="req">*</span>
                  </label>
                  <input
                    name="region_sigungu"
                    value={form.region_sigungu}
                    onChange={handleChange}
                    placeholder="마포구"
                  />
                </div>

                <div className="field full">
                  <label>
                    공간 주소 <span className="req">*</span>
                  </label>
                  <input
                    name="space_address"
                    value={form.space_address}
                    onChange={handleChange}
                    placeholder="서울특별시 마포구 성산동 123-4"
                  />
                </div>

                <div className="field full">
                  <label>프로젝트 유형</label>
                  <div className="chip-group">
                    {[
                      "공간 재생",
                      "폐자재 활용",
                      "상업 공간",
                      "주거 개선",
                      "전시/팝업",
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          form.project_type === type ? "chip on" : "chip"
                        }
                        onClick={() => handleProjectTypeChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>공간 규모</label>
                  <input
                    name="space_size"
                    value={form.space_size}
                    onChange={handleChange}
                    placeholder="약 25평"
                  />
                </div>

                <div className="field">
                  <label>희망 시작일</label>
                  <input
                    type="date"
                    name="desired_start_date"
                    value={form.desired_start_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="field full">
                  <label>
                    설명 <span className="req">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="빈 상가를 지역 주민이 함께 쓰는 공간으로 바꾸고 싶습니다."
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
                  {isSubmitting ? "접수 중..." : "의뢰 보내기 →"}
                </button>
              </div>
            </form>

            <aside className="steps">
              <h4>의뢰 진행 과정</h4>
              <p className="intro">
                의뢰 접수 후 검토를 거쳐 프로젝트로 등록됩니다.
              </p>

              <div className="step current">
                <div className="num">1</div>
                <div>
                  <div className="t">의뢰서 접수</div>
                  <div className="d">공간 정보와 원하는 방향을 확인합니다.</div>
                </div>
              </div>

              <div className="step">
                <div className="num">2</div>
                <div>
                  <div className="t">운영팀 검토</div>
                  <div className="d">
                    일정, 위치, 프로젝트 가능성을 검토합니다.
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="num">3</div>
                <div>
                  <div className="t">프로젝트 등록</div>
                  <div className="d">
                    승인 후 참여자를 모집하는 프로젝트가 됩니다.
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}

        {activeTab === "join" && (
          <section className="project-grid">
            {projects.length === 0 ? (
              <div className="empty-card">
                현재 모집 중인 프로젝트가 없습니다.
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project.project_id} project={project} />
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}
