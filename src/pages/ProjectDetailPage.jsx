import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectDetail } from "../api/user/projectApi";

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await getProjectDetail(projectId);
        setProject(response.data);
      } catch (error) {
        console.error("프로젝트 상세 조회 실패:", error);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  if (isLoading) {
    return (
      <main className="section">
        <div className="shell">
          <div className="detail-loading">
            프로젝트 정보를 불러오는 중입니다.
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="section">
        <div className="shell">
          <div className="empty-card">프로젝트 정보를 찾을 수 없습니다.</div>
        </div>
      </main>
    );
  }

  const isRecruiting = project.status === "RECRUITING";

  return (
    <main className="section">
      <div className="shell">
        <div className="project-detail-layout">
          <section className="project-detail-main">
            <div className="detail-top">
              <span className="region-tag">
                {project.region_sido} · {project.region_sigungu}
              </span>
              <span
                className={`detail-status ${project.status?.toLowerCase()}`}
              >
                {project.status}
              </span>
            </div>

            <h1 className="h-display">{project.title}</h1>
            <p className="detail-summary">{project.summary}</p>

            <div className="detail-hero">
              <div className="detail-hero-text">
                <span>PROJECT</span>
                <strong>studio&amp;lab 우당탕탕</strong>
              </div>
            </div>

            <section className="detail-section">
              <h2>프로젝트 소개</h2>
              <p>
                {project.description ||
                  "프로젝트 설명이 아직 등록되지 않았습니다."}
              </p>
            </section>

            <section className="detail-section">
              <h2>공간 정보</h2>

              <div className="detail-info-grid">
                <div className="detail-info-card">
                  <span>유형</span>
                  <strong>{project.project_type || "-"}</strong>
                </div>

                <div className="detail-info-card">
                  <span>규모</span>
                  <strong>{project.space_size || "-"}</strong>
                </div>

                <div className="detail-info-card wide">
                  <span>주소</span>
                  <strong>{project.address || "-"}</strong>
                </div>
              </div>
            </section>
          </section>

          <aside className="project-detail-side">
            <div className="side-card">
              <h3>참여 현황</h3>

              <div className="side-progress">
                <div className="lbl">
                  <span>승인 인원</span>
                  <strong>
                    {project.approved_participant_count || 0} /{" "}
                    {project.max_participants || "-"}명
                  </strong>
                </div>

                <div className="bar">
                  <div
                    style={{
                      width: project.max_participants
                        ? `${Math.min(
                            ((project.approved_participant_count || 0) /
                              project.max_participants) *
                              100,
                            100,
                          )}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="side-meta">
                <div className="row">
                  <span>상태</span>
                  <strong>{project.status}</strong>
                </div>
                <div className="row">
                  <span>지역</span>
                  <strong>
                    {project.region_sido} {project.region_sigungu}
                  </strong>
                </div>
              </div>

              {isRecruiting ? (
                <Link
                  to={`/projects/${project.project_id}/apply`}
                  className="side-cta"
                >
                  이 프로젝트 참여 신청 →
                </Link>
              ) : (
                <button type="button" className="side-cta disabled" disabled>
                  현재 모집 중이 아닙니다
                </button>
              )}

              <Link to="/recruit" className="side-back">
                ← 모집 목록으로 돌아가기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
