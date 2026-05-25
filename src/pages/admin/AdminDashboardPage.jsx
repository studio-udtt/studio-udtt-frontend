import { useEffect, useMemo, useState } from "react";
import {
  getAdminStatisticsSummary,
  getAdminSiteStats,
} from "../../api/admin/adminStatApi";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [siteStats, setSiteStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        const [summaryResponse, siteStatsResponse] = await Promise.all([
          getAdminStatisticsSummary(),
          getAdminSiteStats(),
        ]);

        if (!ignore) {
          setSummary(summaryResponse.data);
          setSiteStats(normalizeList(siteStatsResponse.data, "stats"));
        }
      } catch (error) {
        if (!ignore) {
          console.error("관리자 대시보드 조회 실패:", error);
          setSummary(null);
          setSiteStats([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const applicationCards = [
    {
      label: "전체 프로젝트",
      value: summary?.total_projects ?? 0,
    },
    {
      label: "모집 중",
      value: summary?.recruiting_projects ?? 0,
    },
    {
      label: "진행 중",
      value: summary?.in_progress_projects ?? 0,
    },
    {
      label: "완료",
      value: summary?.completed_projects ?? 0,
    },
    {
      label: "전체 신청",
      value: summary?.total_applications ?? 0,
    },
    {
      label: "승인 신청",
      value: summary?.approved_applications ?? 0,
    },
    {
      label: "대기 신청",
      value: summary?.pending_applications ?? 0,
    },
  ];

  const maxSiteStatValue = useMemo(() => {
    if (siteStats.length === 0) return 0;

    return Math.max(...siteStats.map((stat) => Number(stat.stat_value) || 0));
  }, [siteStats]);

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">DASHBOARD</span>
          <h1>DASHBOARD</h1>
          <p>데이터를 한눈에 관리하고 확인합니다.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-empty">대시보드 데이터를 불러오는 중입니다.</div>
      ) : (
        <>
          <section className="admin-dashboard-card">
            <div className="admin-stat-grid">
              {applicationCards.map((card) => (
                <article
                  className="admin-stat-card dashboard-main-stat"
                  key={card.label}
                >
                  <span>{card.label}</span>
                  <strong>{Number(card.value).toLocaleString()}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-dashboard-card">
            <div className="admin-dashboard-head">
              <div>
                <h2>누적 데이터</h2>
                <p>사이트에 노출하거나 관리하는 주요 누적 지표입니다.</p>
              </div>

              <span className="admin-dashboard-count">
                {siteStats.length}건
              </span>
            </div>

            {siteStats.length === 0 ? (
              <div className="admin-empty">등록된 누적 데이터가 없습니다.</div>
            ) : (
              <>
                <div className="admin-stat-grid">
                  {siteStats.map((stat) => (
                    <article className="admin-stat-card" key={stat.stat_id}>
                      <span>{stat.stat_label}</span>
                      <strong>
                        {Number(stat.stat_value || 0).toLocaleString()}
                      </strong>
                      <p className="dashboard-stat-desc">
                        {stat.description || "설명 없음"}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="admin-dashboard-chart">
                  <div className="admin-dashboard-chart-head">
                    <h3>누적 데이터 비교</h3>
                    <span>값 기준</span>
                  </div>

                  <div className="admin-dashboard-bar-list">
                    {siteStats.map((stat) => {
                      const value = Number(stat.stat_value) || 0;
                      const width =
                        maxSiteStatValue > 0
                          ? Math.max((value / maxSiteStatValue) * 100, 5)
                          : 0;

                      return (
                        <div
                          className="admin-dashboard-bar-item"
                          key={stat.stat_id}
                        >
                          <div className="admin-dashboard-bar-label">
                            <span>{stat.stat_label}</span>
                            <strong>{value.toLocaleString()}</strong>
                          </div>

                          <div className="admin-dashboard-bar-track">
                            <div
                              className="admin-dashboard-bar-fill"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </section>
  );
}
