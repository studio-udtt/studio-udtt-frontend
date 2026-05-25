import { useEffect, useMemo, useState } from "react";
import {
  approveProjectRequest,
  cancelProjectRequest,
  getAdminProjectRequests,
  rejectProjectRequest,
} from "../../api/admin/adminRequestApi";
import {
  approveApplication,
  cancelApplication,
  getAdminApplications,
  rejectApplication,
} from "../../api/admin/adminApplicationApi";

const extractPageContent = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.content)) return responseData.content;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.content))
    return responseData.data.content;
  return [];
};

const STATUS_FILTERS = [
  { label: "전체", value: "ALL" },
  { label: "대기", value: "PENDING" },
  { label: "승인", value: "APPROVED" },
  { label: "반려", value: "REJECTED" },
  { label: "취소", value: "CANCELED" },
];

const STATUS_LABELS = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELED: "취소",
};

const ACTION_MODAL_META = {
  approveProject: {
    eyebrow: "APPROVE REQUEST",
    title: "프로젝트 의뢰 승인",
    description: "의뢰 신청을 승인하고 프로젝트 생성 정보를 입력합니다.",
    submitText: "승인 처리",
  },
  rejectProject: {
    eyebrow: "REJECT REQUEST",
    title: "프로젝트 의뢰 반려",
    description: "의뢰 신청을 반려할 사유를 입력합니다.",
    submitText: "반려 처리",
  },
  cancelProject: {
    eyebrow: "CANCEL REQUEST",
    title: "프로젝트 의뢰 취소",
    description: "의뢰 신청을 취소 처리합니다.",
    submitText: "취소 처리",
  },
  approveApplication: {
    eyebrow: "APPROVE APPLICATION",
    title: "프로젝트 참여 신청 승인",
    description: "참여 신청을 승인 처리합니다.",
    submitText: "승인 처리",
  },
  rejectApplication: {
    eyebrow: "REJECT APPLICATION",
    title: "프로젝트 참여 신청 반려",
    description: "참여 신청을 반려할 사유를 입력합니다.",
    submitText: "반려 처리",
  },
  cancelApplication: {
    eyebrow: "CANCEL APPLICATION",
    title: "프로젝트 참여 신청 취소",
    description: "참여 신청을 취소 처리합니다.",
    submitText: "취소 처리",
  },
};

const initialActionForm = {
  title: "",
  summary: "",
  max_participants: "20",
  latitude: "",
  longitude: "",
  reject_reason: "",
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState("projectRequests");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectRequests, setProjectRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionModal, setActionModal] = useState(null);
  const [actionForm, setActionForm] = useState(initialActionForm);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequestsData = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const [projectRequestResponse, applicationResponse] = await Promise.all([
        getAdminProjectRequests({
          page: 0,
          size: 20,
        }),
        getAdminApplications({
          page: 0,
          size: 20,
        }),
      ]);

      console.log("의뢰 신청 응답:", projectRequestResponse.data);
      console.log("참여 신청 응답:", applicationResponse.data);

      setProjectRequests(extractPageContent(projectRequestResponse.data));
      setApplications(extractPageContent(applicationResponse.data));
    } catch (error) {
      console.error("신청 관리 목록 조회 실패:", error);
      setProjectRequests([]);
      setApplications([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const [projectRequestResponse, applicationResponse] = await Promise.all(
          [
            getAdminProjectRequests({
              page: 0,
              size: 20,
            }),
            getAdminApplications({
              page: 0,
              size: 20,
            }),
          ],
        );

        console.log("초기 의뢰 신청 응답:", projectRequestResponse.data);
        console.log("초기 참여 신청 응답:", applicationResponse.data);

        if (!ignore) {
          setProjectRequests(extractPageContent(projectRequestResponse.data));
          setApplications(extractPageContent(applicationResponse.data));
        }
      } catch (error) {
        if (!ignore) {
          console.error("신청 관리 목록 조회 실패:", error);
          setProjectRequests([]);
          setApplications([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = () => {
    loadRequestsData();
  };

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    setStatusFilter("ALL");
  };

  const openActionModal = (type, target) => {
    setActionModal({ type, target });

    if (type === "approveProject") {
      setActionForm({
        ...initialActionForm,
        title: target.project_type
          ? `${target.project_type} 프로젝트`
          : "신규 프로젝트",
        summary: target.space_address
          ? `${target.space_address} 기반 프로젝트입니다.`
          : "",
      });
      return;
    }

    setActionForm(initialActionForm);
  };

  const closeActionModal = () => {
    if (isProcessing) return;

    setActionModal(null);
    setActionForm(initialActionForm);
  };

  const handleActionFormChange = (event) => {
    const { name, value } = event.target;

    setActionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitAction = async (event) => {
    event.preventDefault();

    if (!actionModal) return;

    const { type, target } = actionModal;

    try {
      setIsProcessing(true);

      if (type === "approveProject") {
        const maxParticipants = Number(actionForm.max_participants || 20);
        const latitude = Number(actionForm.latitude);
        const longitude = Number(actionForm.longitude);

        if (!actionForm.title.trim()) {
          alert("프로젝트 제목을 입력해 주세요.");
          return;
        }

        if (!actionForm.summary.trim()) {
          alert("프로젝트 요약을 입력해 주세요.");
          return;
        }

        if (Number.isNaN(maxParticipants) || maxParticipants <= 0) {
          alert("최대 참여 인원은 1명 이상의 숫자로 입력해야 합니다.");
          return;
        }

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          alert("위도와 경도는 숫자로 입력해야 합니다.");
          return;
        }

        const payload = {
          title: actionForm.title,
          summary: actionForm.summary,
          description: actionForm.summary,
          recruit_start_date: "2026-06-01",
          recruit_end_date: "2026-06-10",
          project_start_date: "2026-06-15",
          project_end_date: "2026-07-05",
          max_participants: maxParticipants,
          latitude,
          longitude,
          is_visible: true,
        };

        const response = await approveProjectRequest(
          target.request_id,
          payload,
        );
        alert(response.data.message || "의뢰가 승인되었습니다.");
      }

      if (type === "rejectProject") {
        if (!actionForm.reject_reason.trim()) {
          alert("반려 사유를 입력해 주세요.");
          return;
        }

        const response = await rejectProjectRequest(target.request_id, {
          reject_reason: actionForm.reject_reason,
        });

        alert(response.data.message || "의뢰가 반려되었습니다.");
      }

      if (type === "cancelProject") {
        const response = await cancelProjectRequest(target.request_id);
        alert(response.data.message || "의뢰가 취소 처리되었습니다.");
      }

      if (type === "approveApplication") {
        const response = await approveApplication(target.application_id);
        alert(response.data.message || "참여 신청이 승인되었습니다.");
      }

      if (type === "rejectApplication") {
        if (!actionForm.reject_reason.trim()) {
          alert("반려 사유를 입력해 주세요.");
          return;
        }

        const response = await rejectApplication(target.application_id, {
          reject_reason: actionForm.reject_reason,
        });

        alert(response.data.message || "참여 신청이 반려되었습니다.");
      }

      if (type === "cancelApplication") {
        const response = await cancelApplication(target.application_id);
        alert(response.data.message || "참여 신청이 취소 처리되었습니다.");
      }

      closeActionModal();
      loadRequestsData({ showLoading: false });
    } catch (error) {
      console.error("신청 처리 실패:", error);
      alert("신청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const safeProjectRequests = Array.isArray(projectRequests)
    ? projectRequests
    : [];

  const safeApplications = Array.isArray(applications) ? applications : [];

  const currentList =
    activeTab === "projectRequests" ? safeProjectRequests : safeApplications;

  const filteredProjectRequests = useMemo(() => {
    if (statusFilter === "ALL") {
      return safeProjectRequests;
    }

    return safeProjectRequests.filter(
      (request) => request.status === statusFilter,
    );
  }, [safeProjectRequests, statusFilter]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "ALL") {
      return safeApplications;
    }

    return safeApplications.filter(
      (application) => application.status === statusFilter,
    );
  }, [safeApplications, statusFilter]);

  const statusCounts = useMemo(() => {
    return STATUS_FILTERS.reduce((acc, filter) => {
      if (filter.value === "ALL") {
        acc[filter.value] = currentList.length;
      } else {
        acc[filter.value] = currentList.filter(
          (item) => item.status === filter.value,
        ).length;
      }

      return acc;
    }, {});
  }, [currentList]);

  const renderModalTargetInfo = () => {
    if (!actionModal) return null;

    const { type, target } = actionModal;

    if (type.includes("Project")) {
      return (
        <div className="admin-action-info-grid">
          <div>
            <span>의뢰자</span>
            <strong>{target.requester_name || "-"}</strong>
          </div>
          <div>
            <span>연락처</span>
            <strong>{target.requester_phone || "-"}</strong>
          </div>
          <div>
            <span>주소</span>
            <strong>{target.space_address || "-"}</strong>
          </div>
          <div>
            <span>유형</span>
            <strong>{target.project_type || "-"}</strong>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-action-info-grid">
        <div>
          <span>프로젝트</span>
          <strong>{target.project_title || "-"}</strong>
        </div>
        <div>
          <span>신청자</span>
          <strong>{target.applicant_name || "-"}</strong>
        </div>
        <div>
          <span>연락처</span>
          <strong>{target.applicant_phone || "-"}</strong>
        </div>
        <div>
          <span>직업</span>
          <strong>{target.job || "-"}</strong>
        </div>
      </div>
    );
  };

  const renderActionModalFields = () => {
    if (!actionModal) return null;

    const { type } = actionModal;

    if (type === "approveProject") {
      return (
        <>
          <div className="admin-field">
            <label>프로젝트 제목 *</label>
            <input
              name="title"
              value={actionForm.title}
              onChange={handleActionFormChange}
              placeholder="예: 춘천 폐자재 공간 재생 프로젝트"
            />
          </div>

          <div className="admin-field">
            <label>프로젝트 요약 *</label>
            <textarea
              name="summary"
              value={actionForm.summary}
              onChange={handleActionFormChange}
              placeholder="프로젝트 요약을 입력하세요."
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label>최대 참여 인원 *</label>
              <input
                name="max_participants"
                value={actionForm.max_participants}
                onChange={handleActionFormChange}
                placeholder="20"
              />
            </div>

            <div className="admin-field">
              <label>위도 *</label>
              <input
                name="latitude"
                value={actionForm.latitude}
                onChange={handleActionFormChange}
                placeholder="예: 37.5665"
              />
            </div>

            <div className="admin-field">
              <label>경도 *</label>
              <input
                name="longitude"
                value={actionForm.longitude}
                onChange={handleActionFormChange}
                placeholder="예: 126.9780"
              />
            </div>
          </div>
        </>
      );
    }

    if (type === "rejectProject" || type === "rejectApplication") {
      return (
        <div className="admin-field">
          <label>반려 사유 *</label>
          <textarea
            name="reject_reason"
            value={actionForm.reject_reason}
            onChange={handleActionFormChange}
            placeholder="반려 사유를 입력하세요."
          />
        </div>
      );
    }

    return (
      <div className="admin-action-confirm-box">
        <strong>정말 취소 처리할까요?</strong>
        <p>
          취소 처리 후 상태가 변경됩니다. 계속 진행하려면 아래 버튼을 눌러
          주세요.
        </p>
      </div>
    );
  };

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">team 우당탕탕</span>
          <h1>신청 관리</h1>
          <p>프로젝트 의뢰 신청과 참여 신청을 관리합니다.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={handleRefresh}
        >
          새로고침
        </button>
      </div>

      <div className="admin-tab">
        <button
          type="button"
          className={activeTab === "projectRequests" ? "active" : ""}
          onClick={() => handleChangeTab("projectRequests")}
        >
          프로젝트 의뢰 신청
        </button>

        <button
          type="button"
          className={activeTab === "applications" ? "active" : ""}
          onClick={() => handleChangeTab("applications")}
        >
          프로젝트 참여 신청
        </button>
      </div>

      <div className="admin-filter-card">
        <div>
          <strong>상태 필터</strong>
          <p>신청 상태별로 목록을 확인할 수 있습니다.</p>
        </div>

        <div className="admin-status-filter">
          {STATUS_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={statusFilter === filter.value ? "active" : ""}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
              <span>{statusCounts[filter.value] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="admin-empty">목록을 불러오는 중입니다.</div>
      )}

      {!isLoading && activeTab === "projectRequests" && (
        <section className="admin-table-card">
          <div className="admin-table-head">
            <h2>의뢰 신청 목록</h2>
            <span>{filteredProjectRequests.length}건</span>
          </div>

          {filteredProjectRequests.length === 0 ? (
            <div className="admin-empty admin-table-empty">
              조건에 맞는 의뢰 신청이 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>의뢰자</th>
                    <th>연락처</th>
                    <th>주소</th>
                    <th>유형</th>
                    <th>상태</th>
                    <th>신청일</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjectRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>
                        <strong className="admin-project-title">
                          {request.requester_name || "-"}
                        </strong>
                      </td>
                      <td>{request.requester_phone || "-"}</td>
                      <td className="admin-td-wide">
                        {request.space_address || "-"}
                      </td>
                      <td>{request.project_type || "-"}</td>
                      <td>
                        <span
                          className={`admin-status ${request.status?.toLowerCase() || ""}`}
                        >
                          {STATUS_LABELS[request.status] ||
                            request.status ||
                            "-"}
                        </span>
                      </td>
                      <td>{formatDateTime(request.created_at)}</td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action approve"
                            onClick={() =>
                              openActionModal("approveProject", request)
                            }
                          >
                            승인
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              openActionModal("rejectProject", request)
                            }
                          >
                            반려
                          </button>

                          <button
                            type="button"
                            className="admin-action cancel"
                            onClick={() =>
                              openActionModal("cancelProject", request)
                            }
                          >
                            취소
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

      {!isLoading && activeTab === "applications" && (
        <section className="admin-table-card">
          <div className="admin-table-head">
            <h2>참여 신청 목록</h2>
            <span>{filteredApplications.length}건</span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="admin-empty admin-table-empty">
              조건에 맞는 참여 신청이 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>프로젝트</th>
                    <th>신청자</th>
                    <th>연락처</th>
                    <th>직업</th>
                    <th>상태</th>
                    <th>신청일</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.application_id}>
                      <td>{application.application_id}</td>
                      <td className="admin-td-wide">
                        <strong className="admin-project-title">
                          {application.project_title || "-"}
                        </strong>
                      </td>
                      <td>{application.applicant_name || "-"}</td>
                      <td>{application.applicant_phone || "-"}</td>
                      <td>{application.job || "-"}</td>
                      <td>
                        <span
                          className={`admin-status ${application.status?.toLowerCase() || ""}`}
                        >
                          {STATUS_LABELS[application.status] ||
                            application.status ||
                            "-"}
                        </span>
                      </td>
                      <td>{formatDateTime(application.created_at)}</td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action approve"
                            onClick={() =>
                              openActionModal("approveApplication", application)
                            }
                          >
                            승인
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              openActionModal("rejectApplication", application)
                            }
                          >
                            반려
                          </button>

                          <button
                            type="button"
                            className="admin-action cancel"
                            onClick={() =>
                              openActionModal("cancelApplication", application)
                            }
                          >
                            취소
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

      {actionModal && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal admin-action-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-eyebrow">
                  {ACTION_MODAL_META[actionModal.type].eyebrow}
                </span>
                <h2>{ACTION_MODAL_META[actionModal.type].title}</h2>
                <p>{ACTION_MODAL_META[actionModal.type].description}</p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeActionModal}
              >
                ×
              </button>
            </div>

            <form className="admin-edit-form" onSubmit={handleSubmitAction}>
              {renderModalTargetInfo()}

              {renderActionModalFields()}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeActionModal}
                >
                  닫기
                </button>

                <button
                  type="submit"
                  className="admin-save-btn"
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "처리 중..."
                    : ACTION_MODAL_META[actionModal.type].submitText}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
