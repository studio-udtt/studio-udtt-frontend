import { useEffect, useState } from "react";
import {
  createAdminSiteStat,
  deleteAdminSiteStat,
  getAdminProjectStatistics,
  getAdminSiteStats,
  getAdminStatisticsSummary,
  updateAdminSiteStat,
} from "../../api/admin/adminStatApi";

const initialForm = {
  stat_key: "",
  stat_label: "",
  stat_value: "",
  description: "",
};

const PROJECT_STATUS_OPTIONS = [
  { label: "전체", value: "" },
  { label: "모집 중", value: "RECRUITING" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "완료", value: "COMPLETED" },
  { label: "취소", value: "CANCELED" },
];

export default function AdminStatsPage() {
  const [summary, setSummary] = useState(null);
  const [siteStats, setSiteStats] = useState([]);
  const [projectStats, setProjectStats] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [projectFilter, setProjectFilter] = useState({
    project_id: "",
    status: "",
  });

  const normalizeList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  const loadStats = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const [summaryResponse, siteStatsResponse, projectStatsResponse] =
        await Promise.all([
          getAdminStatisticsSummary(),
          getAdminSiteStats(),
          getAdminProjectStatistics({
            project_id: projectFilter.project_id || undefined,
            status: projectFilter.status || undefined,
          }),
        ]);

      setSummary(summaryResponse.data);
      setSiteStats(normalizeList(siteStatsResponse.data, "stats"));
      setProjectStats(normalizeList(projectStatsResponse.data, "statistics"));
    } catch (error) {
      console.error("관리자 통계 조회 실패:", error);
      setSummary(null);
      setSiteStats([]);
      setProjectStats([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialStats = async () => {
      try {
        const [summaryResponse, siteStatsResponse, projectStatsResponse] =
          await Promise.all([
            getAdminStatisticsSummary(),
            getAdminSiteStats(),
            getAdminProjectStatistics(),
          ]);

        if (!ignore) {
          setSummary(summaryResponse.data);
          setSiteStats(normalizeList(siteStatsResponse.data, "stats"));
          setProjectStats(
            normalizeList(projectStatsResponse.data, "statistics"),
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error("관리자 통계 조회 실패:", error);
          setSummary(null);
          setSiteStats([]);
          setProjectStats([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialStats();

    return () => {
      ignore = true;
    };
  }, []);

  const summaryCards = [
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

  const openCreateModal = () => {
    setEditingStat(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (stat) => {
    setEditingStat(stat);
    setForm({
      stat_key: stat.stat_key || "",
      stat_label: stat.stat_label || "",
      stat_value: stat.stat_value ?? "",
      description: stat.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingStat(null);
    setForm(initialForm);
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectFilterChange = (event) => {
    const { name, value } = event.target;

    setProjectFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitStat = async (event) => {
    event.preventDefault();

    if (!form.stat_key || !form.stat_label || form.stat_value === "") {
      alert("통계 키, 라벨, 값은 필수입니다.");
      return;
    }

    const payload = {
      ...form,
      stat_value: Number(form.stat_value),
    };

    try {
      if (editingStat) {
        const response = await updateAdminSiteStat(editingStat.stat_id, {
          stat_label: payload.stat_label,
          stat_value: payload.stat_value,
          description: payload.description,
        });

        alert(response.data.message || "누적 데이터가 수정되었습니다.");
      } else {
        const response = await createAdminSiteStat(payload);

        alert(response.data.message || "누적 데이터가 추가되었습니다.");
      }

      closeModal();
      loadStats({ showLoading: false });
    } catch (error) {
      console.error("누적 데이터 저장 실패:", error);
      alert("누적 데이터 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteStat = async (statId) => {
    const ok = window.confirm("이 누적 데이터를 삭제할까요?");
    if (!ok) return;

    try {
      const response = await deleteAdminSiteStat(statId);

      alert(response.data.message || "누적 데이터가 삭제되었습니다.");
      loadStats({ showLoading: false });
    } catch (error) {
      console.error("누적 데이터 삭제 실패:", error);
      alert("누적 데이터 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSearchProjectStats = async () => {
    try {
      setIsLoading(true);

      const response = await getAdminProjectStatistics({
        project_id: projectFilter.project_id || undefined,
        status: projectFilter.status || undefined,
      });

      setProjectStats(normalizeList(response.data, "statistics"));
    } catch (error) {
      console.error("프로젝트별 통계 조회 실패:", error);
      setProjectStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">STATISTICS</span>
          <h1>통계 관리</h1>
          <p>누적 데이터와 프로젝트별 신청 통계를 관리합니다.</p>
        </div>

        <div className="admin-head-actions">
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => loadStats()}
          >
            새로고침
          </button>

          <button
            type="button"
            className="admin-create-btn"
            onClick={openCreateModal}
          >
            누적 데이터 추가
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-empty">통계 데이터를 불러오는 중입니다.</div>
      ) : (
        <>
          <section className="admin-stat-grid">
            {summaryCards.map((card) => (
              <article className="admin-stat-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </section>

          <section className="admin-table-card">
            <div className="admin-table-head">
              <h2>누적 데이터 목록</h2>
              <span>{siteStats.length}건</span>
            </div>

            {siteStats.length === 0 ? (
              <div className="admin-empty">등록된 누적 데이터가 없습니다.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>키</th>
                      <th>라벨</th>
                      <th>값</th>
                      <th>설명</th>
                      <th>관리</th>
                    </tr>
                  </thead>

                  <tbody>
                    {siteStats.map((stat) => (
                      <tr key={stat.stat_id}>
                        <td>{stat.stat_id}</td>
                        <td>
                          <code className="admin-code">{stat.stat_key}</code>
                        </td>
                        <td>
                          <strong className="admin-project-title">
                            {stat.stat_label}
                          </strong>
                        </td>
                        <td>
                          <strong className="admin-stat-value">
                            {stat.stat_value}
                          </strong>
                        </td>
                        <td className="admin-td-wide">
                          {stat.description || "-"}
                        </td>
                        <td>
                          <div className="admin-action-group">
                            <button
                              type="button"
                              className="admin-action approve"
                              onClick={() => openEditModal(stat)}
                            >
                              수정
                            </button>

                            <button
                              type="button"
                              className="admin-action reject"
                              onClick={() => handleDeleteStat(stat.stat_id)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-table-card">
            <div className="admin-table-head">
              <div>
                <h2>프로젝트별 통계</h2>
                <span>프로젝트 신청 현황을 확인합니다.</span>
              </div>

              <div className="admin-stats-filter">
                <input
                  name="project_id"
                  value={projectFilter.project_id}
                  onChange={handleProjectFilterChange}
                  placeholder="프로젝트 ID"
                />

                <select
                  name="status"
                  value={projectFilter.status}
                  onChange={handleProjectFilterChange}
                >
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <option value={option.value} key={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button type="button" onClick={handleSearchProjectStats}>
                  조회
                </button>
              </div>
            </div>

            {projectStats.length === 0 ? (
              <div className="admin-empty">프로젝트별 통계가 없습니다.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>프로젝트 ID</th>
                      <th>프로젝트명</th>
                      <th>전체 신청</th>
                      <th>승인</th>
                      <th>대기</th>
                      <th>반려</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projectStats.map((stat) => (
                      <tr key={stat.project_id}>
                        <td>{stat.project_id}</td>
                        <td className="admin-td-wide">
                          <strong className="admin-project-title">
                            {stat.title}
                          </strong>
                        </td>
                        <td>{stat.total_applications ?? 0}</td>
                        <td>{stat.approved_applications ?? 0}</td>
                        <td>{stat.pending_applications ?? 0}</td>
                        <td>{stat.rejected_applications ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-eyebrow">
                  {editingStat ? "EDIT STAT" : "CREATE STAT"}
                </span>
                <h2>{editingStat ? "누적 데이터 수정" : "누적 데이터 추가"}</h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="admin-edit-form" onSubmit={handleSubmitStat}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>통계 키 *</label>
                  <input
                    name="stat_key"
                    value={form.stat_key}
                    onChange={handleFormChange}
                    placeholder="total_participants"
                    disabled={Boolean(editingStat)}
                  />
                </div>

                <div className="admin-field">
                  <label>통계 라벨 *</label>
                  <input
                    name="stat_label"
                    value={form.stat_label}
                    onChange={handleFormChange}
                    placeholder="누적 참여자 수"
                  />
                </div>

                <div className="admin-field">
                  <label>값 *</label>
                  <input
                    type="number"
                    name="stat_value"
                    value={form.stat_value}
                    onChange={handleFormChange}
                    placeholder="1248"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>설명</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="지금까지 프로젝트에 참여한 누적 인원"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeModal}
                >
                  취소
                </button>

                <button type="submit" className="admin-save-btn">
                  {editingStat ? "수정 저장" : "추가하기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
