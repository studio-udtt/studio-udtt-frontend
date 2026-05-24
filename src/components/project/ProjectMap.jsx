import { useState } from "react";
import ProjectInfoPanel from "./ProjectInfoPanel";

const positions = [
  ["49%", "38%"],
  ["52%", "41%"],
  ["56%", "35%"],
  ["44%", "44%"],
  ["58%", "60%"],
  ["38%", "70%"],
  ["42%", "50%"],
  ["50%", "65%"],
];

export default function ProjectMap({ projects = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeSelectedIndex =
    projects.length > 0 ? Math.min(selectedIndex, projects.length - 1) : 0;

  const selectedProject = projects[safeSelectedIndex];

  const [labelLeft, labelTop] = positions[
    safeSelectedIndex % positions.length
  ] || ["49%", "38%"];

  return (
    <div className="map-layout">
      <div className="map-area">
        <div className="map-toolbar">
          <button className="on">진행중</button>
          <button className="on complete">완료</button>
          <button>전체</button>
        </div>

        <div className="map-counter">
          <div className="n">
            {projects.length}
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
          <text x="295" y="220" fontSize="13" fill="#8B7355">
            서울
          </text>
          <text x="320" y="280" fontSize="11" fill="#8B7355">
            충청
          </text>
          <text x="335" y="395" fontSize="11" fill="#8B7355">
            경상
          </text>
          <text x="255" y="430" fontSize="11" fill="#8B7355">
            전라
          </text>
          <text x="225" y="556" fontSize="10" fill="#8B7355">
            제주
          </text>
        </svg>

        {projects.map((project, index) => {
          const [left, top] = positions[index % positions.length];

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
          <div className="pin-label" style={{ left: labelLeft, top: labelTop }}>
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
