import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.project_id}`} className="project-card">
      <div className="pc-top">
        <span className="region">
          {project.region_sido} · {project.region_sigungu}
        </span>

        <span className="pill recruiting">{project.status}</span>
      </div>

      <h3>{project.title}</h3>
      <p>{project.summary}</p>

      <div className="pc-meta">
        <span>
          유형 <strong>{project.project_type}</strong>
        </span>
        <span>
          규모 <strong>{project.space_size}</strong>
        </span>
      </div>
    </Link>
  );
}
