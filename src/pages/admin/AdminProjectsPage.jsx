import { useEffect, useState } from "react";
import {
  deleteAdminProject,
  getAdminProjects,
  updateAdminProject,
  updateAdminProjectStatus,
} from "../../api/admin/adminProjectApi";

const STATUS_OPTIONS = ["RECRUITING", "IN_PROGRESS", "COMPLETED", "CANCELED"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    summary: "",
    description: "",
    project_type: "",
    space_size: "",
    max_participants: "",
    is_visible: true,
  });

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.projects)) return data.projects;
    return [];
  };

  const loadProjects = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const response = await getAdminProjects({
        page: 0,
        size: 50,
      });

      setProjects(normalizeList(response.data));
    } catch (error) {
      console.error("관리자 프로젝트 목록 조회 실패:", error);
      setProjects([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialProjects = async () => {
      try {
        const response = await getAdminProjects({
          page: 0,
          size: 50,
        });

        if (!ignore) {
          setProjects(normalizeList(response.data));
        }
      } catch (error) {
        if (!ignore) {
          console.error("관리자 프로젝트 목록 조회 실패:", error);
          setProjects([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialProjects();

    return () => {
      ignore = true;
    };
  }, []);

  const handleStatusChange = async (projectId, status) => {
    const ok = window.confirm(`프로젝트 상태를 ${status}(으)로 변경할까요?`);
    if (!ok) return;

    try {
      const response = await updateAdminProjectStatus(projectId, {
        status,
      });

      alert(response.data.message || "프로젝트 상태가 변경되었습니다.");
      loadProjects({ showLoading: false });
    } catch (error) {
      console.error("프로젝트 상태 변경 실패:", error);
      alert("프로젝트 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title || "",
      summary: project.summary || "",
      description: project.description || "",
      project_type: project.project_type || "",
      space_size: project.space_size || "",
      max_participants: project.max_participants || "",
      is_visible: project.is_visible ?? true,
    });
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setEditForm({
      title: "",
      summary: "",
      description: "",
      project_type: "",
      space_size: "",
      max_participants: "",
      is_visible: true,
    });
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();

    if (!editingProject) return;

    if (!editForm.title || !editForm.summary) {
      alert("제목과 요약은 필수입니다.");
      return;
    }

    const payload = {
      ...editForm,
      max_participants: Number(editForm.max_participants || 0),
    };

    try {
      const response = await updateAdminProject(
        editingProject.project_id,
        payload,
      );

      alert(response.data.message || "프로젝트 정보가 수정되었습니다.");
      closeEditModal();
      loadProjects({ showLoading: false });
    } catch (error) {
      console.error("프로젝트 수정 실패:", error);
      alert("프로젝트 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    const ok = window.confirm(
      "이 프로젝트를 삭제 또는 취소 처리할까요? 이 작업은 되돌리기 어렵습니다.",
    );

    if (!ok) return;

    try {
      const response = await deleteAdminProject(projectId);
      alert(response.data.message || "프로젝트가 삭제 처리되었습니다.");
      loadProjects({ showLoading: false });
    } catch (error) {
      console.error("프로젝트 삭제 실패:", error);
      alert("프로젝트 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">PROJECTS</span>
          <h1>프로젝트 관리</h1>
          <p>등록된 프로젝트의 상태, 노출 여부, 기본 정보를 관리합니다.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={() => loadProjects()}
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="admin-empty">프로젝트 목록을 불러오는 중입니다.</div>
      ) : (
        <section className="admin-table-card">
          <div className="admin-table-head">
            <h2>프로젝트 목록</h2>
            <span>{projects.length}건</span>
          </div>

          {projects.length === 0 ? (
            <div className="admin-empty">등록된 프로젝트가 없습니다.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>프로젝트명</th>
                    <th>지역</th>
                    <th>유형</th>
                    <th>참여</th>
                    <th>상태</th>
                    <th>노출</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr key={project.project_id}>
                      <td>{project.project_id}</td>

                      <td className="admin-td-wide">
                        <strong className="admin-project-title">
                          {project.title}
                        </strong>
                        <p className="admin-project-summary">
                          {project.summary}
                        </p>
                      </td>

                      <td>
                        {project.region_sido} {project.region_sigungu}
                      </td>

                      <td>{project.project_type || "-"}</td>

                      <td>
                        {project.approved_participant_count || 0} /{" "}
                        {project.max_participants || "-"}명
                      </td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={project.status || ""}
                          onChange={(event) =>
                            handleStatusChange(
                              project.project_id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="" disabled>
                            상태 선택
                          </option>
                          {STATUS_OPTIONS.map((status) => (
                            <option value={status} key={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <span
                          className={`admin-visible ${
                            project.is_visible ? "on" : "off"
                          }`}
                        >
                          {project.is_visible ? "노출" : "숨김"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action approve"
                            onClick={() => openEditModal(project)}
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              handleDeleteProject(project.project_id)
                            }
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
      )}

      {editingProject && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-eyebrow">EDIT PROJECT</span>
                <h2>프로젝트 수정</h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <form className="admin-edit-form" onSubmit={handleUpdateProject}>
              <div className="admin-field">
                <label>프로젝트 제목 *</label>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="프로젝트 제목"
                />
              </div>

              <div className="admin-field">
                <label>요약 *</label>
                <input
                  name="summary"
                  value={editForm.summary}
                  onChange={handleEditChange}
                  placeholder="프로젝트 요약"
                />
              </div>

              <div className="admin-field">
                <label>설명</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="프로젝트 상세 설명"
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>프로젝트 유형</label>
                  <input
                    name="project_type"
                    value={editForm.project_type}
                    onChange={handleEditChange}
                    placeholder="공간 재생"
                  />
                </div>

                <div className="admin-field">
                  <label>공간 규모</label>
                  <input
                    name="space_size"
                    value={editForm.space_size}
                    onChange={handleEditChange}
                    placeholder="약 25평"
                  />
                </div>

                <div className="admin-field">
                  <label>최대 참여 인원</label>
                  <input
                    type="number"
                    name="max_participants"
                    value={editForm.max_participants}
                    onChange={handleEditChange}
                    placeholder="20"
                  />
                </div>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    name="is_visible"
                    checked={editForm.is_visible}
                    onChange={handleEditChange}
                  />
                  사용자 화면에 노출
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeEditModal}
                >
                  취소
                </button>

                <button type="submit" className="admin-save-btn">
                  수정 저장
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
