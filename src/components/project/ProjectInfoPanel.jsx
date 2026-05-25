import { Link } from "react-router-dom";

export default function ProjectInfoPanel({ project }) {
  if (!project) {
    return (
      <aside className="info-panel">
        <h2>프로젝트를 불러오는 중입니다</h2>
        <p className="desc">지도 데이터를 확인하고 있습니다.</p>
      </aside>
    );
  }

  return (
    <aside className="info-panel">
      <div>
        <span className="region-tag">
          {project.region_sido} · {project.region_sigungu}
        </span>
        <span className="status">{project.status}</span>
      </div>

      <h2>{project.title}</h2>

      <p className="desc">{project.summary}</p>

      <div className="info-meta">
        <div className="row">
          <div className="k">위치</div>
          <div className="v">
            {project.region_sido} {project.region_sigungu}
          </div>
        </div>

        <div className="row">
          <div className="k">기간</div>
          <div className="v">
            {project.project_start_date} → {project.project_end_date}
          </div>
        </div>

        <div className="row">
          <div className="k">참여</div>
          <div className="v">{project.approved_participant_count}명</div>
        </div>
      </div>

      <div className="info-progress">
        <div className="lbl">
          <span>진행 상태</span>
          <strong>{project.status}</strong>
        </div>
        <div className="bar">
          <div />
        </div>
      </div>

      <Link to={`/projects/${project.project_id}/apply`} className="info-cta">
        이 프로젝트 참여 신청 →
      </Link>
    </aside>
  );
}
