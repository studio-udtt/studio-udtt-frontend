import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import ProjectInfoPanel from "./ProjectInfoPanel";

const DEVICE_ID = "ESP32_S3_1";

const DEFAULT_TELEMETRY = {
  device_id: DEVICE_ID,
  breathOfSpaceIndex: 0,
  currentPeopleCount: 0,
  totalVisitorCount: 0,
  isMoving: false,
  globalPeakToPeak: 0,
  soundStatus: "-",
  globalLux: 0,
  luxStatus: "-",
  updated_at: null,
};

const normalizeTelemetry = (data) => {
  const source = data?.data || data || {};

  return {
    device_id: source.device_id || source.deviceId || DEVICE_ID,
    breathOfSpaceIndex:
      source.breathOfSpaceIndex ??
      source.breath_of_space_index ??
      DEFAULT_TELEMETRY.breathOfSpaceIndex,
    currentPeopleCount:
      source.currentPeopleCount ??
      source.current_people_count ??
      DEFAULT_TELEMETRY.currentPeopleCount,
    totalVisitorCount:
      source.totalVisitorCount ??
      source.total_visitor_count ??
      DEFAULT_TELEMETRY.totalVisitorCount,
    isMoving: source.isMoving ?? source.is_moving ?? DEFAULT_TELEMETRY.isMoving,
    globalPeakToPeak:
      source.globalPeakToPeak ??
      source.global_peak_to_peak ??
      DEFAULT_TELEMETRY.globalPeakToPeak,
    soundStatus:
      source.soundStatus ??
      source.sound_status ??
      DEFAULT_TELEMETRY.soundStatus,
    globalLux:
      source.globalLux ?? source.global_lux ?? DEFAULT_TELEMETRY.globalLux,
    luxStatus:
      source.luxStatus ?? source.lux_status ?? DEFAULT_TELEMETRY.luxStatus,
    updated_at:
      source.updated_at ||
      source.updatedAt ||
      source.created_at ||
      source.createdAt ||
      null,
  };
};

const formatUpdatedAt = (value) => {
  if (!value) return "아직 수신된 데이터가 없습니다.";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatChartTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const clampNumber = (value, min = 0, max = 100) => {
  const number = Number(value);

  if (Number.isNaN(number)) return min;

  return Math.min(Math.max(number, min), max);
};

const buildLinePoints = (items, key, width = 520, height = 180) => {
  if (!items.length) return "";

  const paddingX = 24;
  const paddingY = 20;
  const values = items.map((item) => Number(item[key]) || 0);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  return items
    .map((item, index) => {
      const value = Number(item[key]) || 0;
      const x =
        items.length === 1
          ? width / 2
          : paddingX + (index / (items.length - 1)) * (width - paddingX * 2);

      const y =
        height -
        paddingY -
        ((value - minValue) / range) * (height - paddingY * 2);

      return `${x},${y}`;
    })
    .join(" ");
};

function MiniLineChart({ title, description, items, dataKey, unit = "" }) {
  const latestValue = items.length
    ? Number(items[items.length - 1][dataKey]) || 0
    : 0;

  const points = buildLinePoints(items, dataKey);

  const firstTime = items.length ? formatChartTime(items[0].sampledAt) : "-";
  const lastTime = items.length
    ? formatChartTime(items[items.length - 1].sampledAt)
    : "-";

  return (
    <div className="metric-chart-card">
      <div className="metric-chart-head">
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <strong>
          {latestValue}
          {unit}
        </strong>
      </div>

      <div className="metric-chart">
        {items.length >= 2 ? (
          <svg viewBox="0 0 520 180" preserveAspectRatio="none">
            <line x1="24" y1="20" x2="24" y2="160" className="chart-axis" />
            <line x1="24" y1="160" x2="496" y2="160" className="chart-axis" />
            <polyline points={points} className="chart-line" />
            {points.split(" ").map((point) => {
              const [x, y] = point.split(",");

              return (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="chart-dot"
                />
              );
            })}
          </svg>
        ) : (
          <div className="chart-empty">차트를 만들기 위한 데이터 수집 중</div>
        )}
      </div>

      <div className="metric-chart-time">
        <span>{firstTime}</span>
        <span>{lastTime}</span>
      </div>
    </div>
  );
}

function SpaceBreathDetailModal({ telemetry, history, breathIndex, onClose }) {
  const recentHistory = [...history].slice(-8).reverse();

  return (
    <div
      className="breath-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="breath-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="breath-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="breath-modal-head">
          <div>
            <span>DETAILED METRICS</span>
            <h3 id="breath-modal-title">공간의 숨결 상세 지표</h3>
            <p>
              최신 센서값만 보여주는 것이 아니라, 사용자가 화면을 보는 동안
              수집된 데이터를 시간 흐름에 따라 누적해 보여줍니다.
            </p>
          </div>

          <button
            type="button"
            className="breath-modal-close"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        <div className="breath-modal-summary">
          <div>
            <span>공간의 숨결 지수</span>
            <strong>{breathIndex}/100</strong>
          </div>
          <div>
            <span>현재 인원</span>
            <strong>{telemetry.currentPeopleCount}명</strong>
          </div>
          <div>
            <span>누적 방문자</span>
            <strong>{telemetry.totalVisitorCount}명</strong>
          </div>
          <div>
            <span>마지막 수신</span>
            <strong>{formatUpdatedAt(telemetry.updated_at)}</strong>
          </div>
        </div>

        <div className="metric-chart-grid">
          <MiniLineChart
            title="공간의 숨결 지수 변화"
            description="시간별 공간 활성도 변화를 보여줍니다."
            items={history}
            dataKey="breathOfSpaceIndex"
          />

          <MiniLineChart
            title="누적 방문자 변화"
            description="시간에 따른 누적 방문자 증가 흐름입니다."
            items={history}
            dataKey="totalVisitorCount"
            unit="명"
          />

          <MiniLineChart
            title="현재 인원 변화"
            description="공간에 머무는 인원 변화를 보여줍니다."
            items={history}
            dataKey="currentPeopleCount"
            unit="명"
          />

          <MiniLineChart
            title="조도 변화"
            description="공간 밝기 데이터를 시간축으로 확인합니다."
            items={history}
            dataKey="globalLux"
            unit="lx"
          />
        </div>

        <div className="metric-history-card">
          <div className="metric-history-head">
            <h4>최근 수집 데이터</h4>
            <span>최대 최근 8개 표시</span>
          </div>

          <div className="metric-history-table">
            <div className="metric-history-row head">
              <span>시간</span>
              <span>숨결</span>
              <span>인원</span>
              <span>방문자</span>
              <span>소음</span>
              <span>조도</span>
            </div>

            {recentHistory.length > 0 ? (
              recentHistory.map((item) => (
                <div className="metric-history-row" key={item.sampledAt}>
                  <span>{formatChartTime(item.sampledAt)}</span>
                  <span>{item.breathOfSpaceIndex}</span>
                  <span>{item.currentPeopleCount}명</span>
                  <span>{item.totalVisitorCount}명</span>
                  <span>{item.globalPeakToPeak}</span>
                  <span>{item.globalLux}lx</span>
                </div>
              ))
            ) : (
              <div className="metric-history-empty">
                아직 누적된 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SpaceBreathPanel() {
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(true);
  const [isTelemetryLive, setIsTelemetryLive] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchTelemetry = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/v1/space/telemetry/latest",
          {
            params: {
              device_id: DEVICE_ID,
            },
          },
        );

        const nextTelemetry = normalizeTelemetry(response.data);

        if (!ignore) {
          setTelemetry(nextTelemetry);
          setIsTelemetryLive(true);

          setTelemetryHistory((prev) => {
            const sampledAt =
              nextTelemetry.updated_at || new Date().toISOString();

            const nextItem = {
              ...nextTelemetry,
              breathOfSpaceIndex: clampNumber(nextTelemetry.breathOfSpaceIndex),
              currentPeopleCount: Number(nextTelemetry.currentPeopleCount) || 0,
              totalVisitorCount: Number(nextTelemetry.totalVisitorCount) || 0,
              globalPeakToPeak: Number(nextTelemetry.globalPeakToPeak) || 0,
              globalLux: Number(nextTelemetry.globalLux) || 0,
              sampledAt,
            };

            const lastItem = prev[prev.length - 1];

            if (
              lastItem &&
              formatChartTime(lastItem.sampledAt) ===
                formatChartTime(nextItem.sampledAt) &&
              lastItem.breathOfSpaceIndex === nextItem.breathOfSpaceIndex &&
              lastItem.currentPeopleCount === nextItem.currentPeopleCount &&
              lastItem.totalVisitorCount === nextItem.totalVisitorCount
            ) {
              return prev;
            }

            return [...prev, nextItem].slice(-30);
          });
        }
      } catch (error) {
        console.warn("공간의 숨결 데이터 조회 실패:", error);

        if (!ignore) {
          setTelemetry(DEFAULT_TELEMETRY);
          setIsTelemetryLive(false);
        }
      } finally {
        if (!ignore) {
          setIsTelemetryLoading(false);
        }
      }
    };

    fetchTelemetry();

    const timer = window.setInterval(fetchTelemetry, 5000);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, []);

  const breathIndex = useMemo(() => {
    return clampNumber(telemetry.breathOfSpaceIndex);
  }, [telemetry.breathOfSpaceIndex]);

  return (
    <>
      <aside className="space-breath-panel home-breath-panel">
        <div className="space-breath-top">
          <div>
            <div className="pre">SPACE BREATH</div>
            <h3>공간의 숨결</h3>
          </div>

          <div className={isTelemetryLive ? "breath-live on" : "breath-live"}>
            <span />
            {isTelemetryLive ? "LIVE" : "WAITING"}
          </div>
        </div>

        <p className="space-breath-desc">
          완료된 프로젝트 공간의 인원, 움직임, 소음, 조도 데이터를 바탕으로 현재
          공간의 활성도를 보여줍니다.
        </p>

        <div className="breath-score-box">
          <div className="breath-score-circle">
            <strong>{breathIndex}</strong>
            <span>/ 100</span>
          </div>

          <div className="breath-score-info">
            <span>공간의 숨결 지수</span>
            <p>인원 40%, 소음 40%, 조도 20%와 움직임 가산점을 반영합니다.</p>
          </div>
        </div>

        <div className="breath-progress">
          <div style={{ width: `${breathIndex}%` }} />
        </div>

        <button
          type="button"
          className="breath-detail-button"
          onClick={() => setIsDetailOpen(true)}
        >
          상세 지표 보기
        </button>

        <div className="breath-trust-note">
          <strong>{telemetryHistory.length}</strong>
          <span>개의 시간 데이터가 누적되었습니다.</span>
        </div>

        {isTelemetryLoading ? (
          <div className="breath-empty">센서 데이터를 불러오는 중입니다.</div>
        ) : (
          <div className="breath-data-grid">
            <div className="breath-data-card">
              <span>현재 인원</span>
              <strong>{telemetry.currentPeopleCount}명</strong>
            </div>

            <div className="breath-data-card">
              <span>누적 방문자</span>
              <strong>{telemetry.totalVisitorCount}명</strong>
            </div>

            <div className="breath-data-card">
              <span>움직임</span>
              <strong>{telemetry.isMoving ? "감지됨" : "정적"}</strong>
            </div>

            <div className="breath-data-card">
              <span>소음 상태</span>
              <strong>{telemetry.soundStatus}</strong>
              <p>{telemetry.globalPeakToPeak} P-P</p>
            </div>

            <div className="breath-data-card">
              <span>조도 상태</span>
              <strong>{telemetry.luxStatus}</strong>
              <p>{telemetry.globalLux} lx</p>
            </div>

            <div className="breath-data-card">
              <span>기기 ID</span>
              <strong>{telemetry.device_id}</strong>
            </div>
          </div>
        )}

        <div className="breath-updated">
          마지막 수신: {formatUpdatedAt(telemetry.updated_at)}
        </div>
      </aside>

      {isDetailOpen && (
        <SpaceBreathDetailModal
          telemetry={telemetry}
          history={telemetryHistory}
          breathIndex={breathIndex}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
}

function getPinPosition(project) {
  const latitude = Number(project.latitude);
  const longitude = Number(project.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      left: "50%",
      top: "50%",
    };
  }

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

  const isCompletedProject = selectedProject?.status === "COMPLETED";

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
        </div>
      </div>

      {isCompletedProject ? (
        <SpaceBreathPanel />
      ) : (
        <ProjectInfoPanel project={selectedProject} />
      )}
    </div>
  );
}
