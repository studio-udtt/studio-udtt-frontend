import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { getContents } from "../api/user/contentApi";

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

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
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

export default function AboutPage() {
  const [contents, setContents] = useState([]);
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(true);
  const [isTelemetryLive, setIsTelemetryLive] = useState(false);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const contentResponse = await getContents({ status: "PUBLISHED" });
        setContents(normalizeList(contentResponse.data));
      } catch (error) {
        console.error("회사소개 콘텐츠 조회 실패:", error);
        setContents([]);
      }
    };

    fetchContents();
  }, []);

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

        if (!ignore) {
          setTelemetry(normalizeTelemetry(response.data));
          setIsTelemetryLive(true);
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
    const value = Number(telemetry.breathOfSpaceIndex);

    if (Number.isNaN(value)) return 0;

    return Math.min(Math.max(value, 0), 100);
  }, [telemetry.breathOfSpaceIndex]);

  return (
    <main className="section">
      <div className="shell">
        <div className="about-head">
          <span className="eyebrow">ABOUT</span>
          <h1 className="h-display">
            우리는, 잘 만드는 것보다
            <br />
            함께 만드는 걸 더 중요하게 생각해요.
          </h1>
          <p className="lead">
            studio&amp;lab 우당탕탕은 지역의 빈 공간을 발견하고, 사람들과 함께
            고치고 운영하는 공간 프로젝트를 만듭니다.
          </p>
        </div>

        <div className="about-layout">
          <aside className="space-breath-panel">
            <div className="space-breath-top">
              <div>
                <div className="pre">SPACE BREATH</div>
                <h3>공간의 숨결</h3>
              </div>

              <div
                className={isTelemetryLive ? "breath-live on" : "breath-live"}
              >
                <span />
                {isTelemetryLive ? "LIVE" : "WAITING"}
              </div>
            </div>

            <p className="space-breath-desc">
              IoT 센서가 수집한 인원, 움직임, 소음, 조도 데이터를 바탕으로
              공간의 현재 활성도를 보여줍니다.
            </p>

            <div className="breath-score-box">
              <div className="breath-score-circle">
                <strong>{breathIndex}</strong>
                <span>/ 100</span>
              </div>

              <div className="breath-score-info">
                <span>공간의 숨결 지수</span>
                <p>
                  인원 40%, 소음 40%, 조도 20%와 움직임 가산점을 반영합니다.
                </p>
              </div>
            </div>

            <div className="breath-progress">
              <div style={{ width: `${breathIndex}%` }} />
            </div>

            {isTelemetryLoading ? (
              <div className="breath-empty">
                센서 데이터를 불러오는 중입니다.
              </div>
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

          <section className="articles">
            {contents.length === 0 ? (
              <article className="article">
                <div className="thumb" />
                <div>
                  <span className="source">CONTENTS</span>
                  <h4>게시된 콘텐츠를 불러오는 중입니다.</h4>
                  <p>
                    우당탕탕의 프로젝트 소식과 인터뷰가 이 영역에 표시됩니다.
                  </p>
                </div>
              </article>
            ) : (
              contents.map((content) => (
                <article className="article" key={content.content_id}>
                  <div
                    className="thumb"
                    style={{
                      backgroundImage: content.thumbnail_url
                        ? `url(${content.thumbnail_url})`
                        : undefined,
                    }}
                  />

                  <div>
                    <span className="source">
                      {content.content_type || content.source_name}
                    </span>
                    <h4>{content.title}</h4>
                    <p>{content.summary}</p>
                    <div className="date">{content.published_at}</div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
