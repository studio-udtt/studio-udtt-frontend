import { useState } from "react";
import ProjectInfoPanel from "./ProjectInfoPanel";

function getPinPosition(project) {
  const latitude = Number(project.latitude);
  const longitude = Number(project.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      left: "50%",
      top: "50%",
    };
  }

  /**
   * 대략적인 대한민국 지도 범위
   * longitude: 서쪽 124.5 ~ 동쪽 131.0
   * latitude: 남쪽 33.0 ~ 북쪽 38.8
   */
  const minLng = 124.5;
  const maxLng = 131.0;
  const minLat = 33.0;
  const maxLat = 38.8;

  const x = ((longitude - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - latitude) / (maxLat - minLat)) * 100;

  return {
    left: `${Math.min(Math.max(x, 0), 100)}%`,
    top: `${Math.min(Math.max(y, 0), 100)}%`,
  };
}

export default function ProjectMap({ projects = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState("IN_PROGRESS");

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setSelectedIndex(0);
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return project.status === "COMPLETED";

    return project.status !== "COMPLETED";
  });

  const safeSelectedIndex =
    filteredProjects.length > 0
      ? Math.min(selectedIndex, filteredProjects.length - 1)
      : 0;

  const selectedProject = filteredProjects[safeSelectedIndex];

  const selectedPosition = selectedProject
    ? getPinPosition(selectedProject)
    : { left: "50%", top: "50%" };

  return (
    <div className="map-layout">
      <div className="map-area">
        <div className="map-toolbar">
          <button
            type="button"
            className={filter === "IN_PROGRESS" ? "on" : ""}
            onClick={() => handleFilterChange("IN_PROGRESS")}
          >
            진행중
          </button>

          <button
            type="button"
            className={filter === "COMPLETED" ? "on complete" : "complete"}
            onClick={() => handleFilterChange("COMPLETED")}
          >
            완료
          </button>

          <button
            type="button"
            className={filter === "ALL" ? "on" : ""}
            onClick={() => handleFilterChange("ALL")}
          >
            전체
          </button>
        </div>

        <div className="map-counter">
          <div className="n">
            {filteredProjects.length}
            <span>곳</span>
          </div>
          <div className="l">PROJECTS NATIONWIDE</div>
        </div>

        <svg
          className="map-illustration"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M 270 90 C 290 80, 320 85, 340 110 C 360 130, 365 160, 350 180 C 365 195, 380 220, 370 245 C 395 260, 410 290, 395 320 C 410 345, 415 380, 395 410 C 380 440, 360 470, 335 490 C 320 510, 305 525, 285 530 C 260 535, 245 520, 240 495 C 220 480, 210 455, 220 430 C 205 410, 195 380, 210 355 C 200 330, 205 300, 220 280 C 210 255, 215 225, 230 205 C 220 180, 230 150, 250 130 C 255 110, 260 95, 270 90 Z"
            fill="#EADBB8"
            stroke="#C9B68E"
            strokeWidth="2"
            opacity="0.5"
          />

          <ellipse
            cx="245"
            cy="555"
            rx="32"
            ry="14"
            fill="#EADBB8"
            stroke="#C9B68E"
            strokeWidth="2"
            opacity="0.5"
          />

          <text x="292" y="205" fontSize="12" fill="#8B7355">
            경기
          </text>

          <text x="330" y="160" fontSize="12" fill="#8B7355">
            강원
          </text>

          <text x="285" y="230" fontSize="13" fill="#8B7355">
            서울
          </text>

          <text x="318" y="300" fontSize="12" fill="#8B7355">
            충청
          </text>

          <text x="345" y="410" fontSize="12" fill="#8B7355">
            경상
          </text>

          <text x="255" y="440" fontSize="12" fill="#8B7355">
            전라
          </text>

          <text x="225" y="556" fontSize="10" fill="#8B7355">
            제주
          </text>
        </svg>

        {filteredProjects.map((project, index) => {
          const { left, top } = getPinPosition(project);
          const isSelected = safeSelectedIndex === index;

          return (
            <button
              key={project.project_id}
              type="button"
              className={`pin ${
                project.status === "COMPLETED" ? "done" : "progress"
              } ${isSelected ? "selected" : ""}`}
              style={{ left, top }}
              title={project.title}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}

        {selectedProject && (
          <div
            className="pin-label"
            style={{
              left: selectedPosition.left,
              top: selectedPosition.top,
            }}
          >
            {selectedProject.region_sigungu}
          </div>
        )}

        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot progress" />
            진행중
          </div>
          <div className="legend-item">
            <span className="legend-dot done" />
            완료
          </div>
          <div className="legend-item">📍 클릭하면 상세보기</div>
        </div>
      </div>

      <ProjectInfoPanel project={selectedProject} />
    </div>
  );
}
