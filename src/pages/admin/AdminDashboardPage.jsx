import { useEffect, useState } from "react";
import { getAdminStatisticsSummary } from "../../api/admin/adminStatApi";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getAdminStatisticsSummary();
        setSummary(response.data);
      } catch (error) {
        console.error("관리자 통계 요약 조회 실패:", error);
        setSummary(null);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
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

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">DASHBOARD</span>
          <h1>관리자 대시보드</h1>
          <p>프로젝트 운영 현황과 신청 현황을 한눈에 확인합니다.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <section className="admin-guide-card">
        <h2>관리 메뉴</h2>

        <div className="admin-guide-grid">
          <div>
            <h3>신청 관리</h3>
            <p>프로젝트 의뢰 신청과 참여 신청을 승인/반려합니다.</p>
          </div>

          <div>
            <h3>프로젝트 관리</h3>
            <p>등록된 프로젝트의 정보와 상태를 수정합니다.</p>
          </div>

          <div>
            <h3>콘텐츠 관리</h3>
            <p>외부 콘텐츠를 등록하거나 자동 수집을 실행합니다.</p>
          </div>

          <div>
            <h3>문자 발송</h3>
            <p>신청자 또는 의뢰자에게 안내 문자를 발송합니다.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
