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
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.content)) {
    return responseData.content;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.data?.content)) {
    return responseData.data.content;
  }

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

  const handleApproveProjectRequest = async (request) => {
    const title = window.prompt("프로젝트 제목을 입력하세요.");
    if (!title) return;

    const summary = window.prompt("프로젝트 요약을 입력하세요.");
    if (!summary) return;

    const maxParticipantsInput = window.prompt(
      "최대 참여 인원을 입력하세요.",
      "20",
    );
    const maxParticipants = Number(maxParticipantsInput || 20);

    if (Number.isNaN(maxParticipants) || maxParticipants <= 0) {
      alert("최대 참여 인원은 1명 이상의 숫자로 입력해야 합니다.");
      return;
    }

    const latitudeInput = window.prompt(
      `주소: ${request.space_address || "주소 없음"}\n위도를 입력하세요.`,
    );
    if (!latitudeInput) return;

    const longitudeInput = window.prompt(
      `주소: ${request.space_address || "주소 없음"}\n경도를 입력하세요.`,
    );
    if (!longitudeInput) return;

    const latitude = Number(latitudeInput);
    const longitude = Number(longitudeInput);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      alert("위도와 경도는 숫자로 입력해야 합니다.");
      return;
    }

    const payload = {
      title,
      summary,
      description: summary,
      recruit_start_date: "2026-06-01",
      recruit_end_date: "2026-06-10",
      project_start_date: "2026-06-15",
      project_end_date: "2026-07-05",
      max_participants: maxParticipants,
      latitude,
      longitude,
      is_visible: true,
    };

    try {
      const response = await approveProjectRequest(request.request_id, payload);
      alert(response.data.message || "의뢰가 승인되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("의뢰 승인 실패:", error);
      alert("의뢰 승인 중 오류가 발생했습니다.");
    }
  };

  const handleRejectProjectRequest = async (requestId) => {
    const rejectReason = window.prompt("반려 사유를 입력하세요.");
    if (!rejectReason) return;

    try {
      const response = await rejectProjectRequest(requestId, {
        reject_reason: rejectReason,
      });

      alert(response.data.message || "의뢰가 반려되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("의뢰 반려 실패:", error);
      alert("의뢰 반려 중 오류가 발생했습니다.");
    }
  };

  const handleCancelProjectRequest = async (requestId) => {
    const ok = window.confirm("이 의뢰를 취소 처리할까요?");
    if (!ok) return;

    try {
      const response = await cancelProjectRequest(requestId);
      alert(response.data.message || "의뢰가 취소 처리되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("의뢰 취소 실패:", error);
      alert("의뢰 취소 중 오류가 발생했습니다.");
    }
  };

  const handleApproveApplication = async (applicationId) => {
    const ok = window.confirm("이 참여 신청을 승인할까요?");
    if (!ok) return;

    try {
      const response = await approveApplication(applicationId);
      alert(response.data.message || "참여 신청이 승인되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("참여 신청 승인 실패:", error);
      alert("참여 신청 승인 중 오류가 발생했습니다.");
    }
  };

  const handleRejectApplication = async (applicationId) => {
    const rejectReason = window.prompt("반려 사유를 입력하세요.");
    if (!rejectReason) return;

    try {
      const response = await rejectApplication(applicationId, {
        reject_reason: rejectReason,
      });

      alert(response.data.message || "참여 신청이 반려되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("참여 신청 반려 실패:", error);
      alert("참여 신청 반려 중 오류가 발생했습니다.");
    }
  };

  const handleCancelApplication = async (applicationId) => {
    const ok = window.confirm("이 참여 신청을 취소 처리할까요?");
    if (!ok) return;

    try {
      const response = await cancelApplication(applicationId);
      alert(response.data.message || "참여 신청이 취소 처리되었습니다.");
      loadRequestsData();
    } catch (error) {
      console.error("참여 신청 취소 실패:", error);
      alert("참여 신청 취소 중 오류가 발생했습니다.");
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
                    <th>ID</th>
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
                      <td>{request.request_id}</td>
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
                            onClick={() => handleApproveProjectRequest(request)}
                          >
                            승인
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              handleRejectProjectRequest(request.request_id)
                            }
                          >
                            반려
                          </button>

                          <button
                            type="button"
                            className="admin-action cancel"
                            onClick={() =>
                              handleCancelProjectRequest(request.request_id)
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
                              handleApproveApplication(
                                application.application_id,
                              )
                            }
                          >
                            승인
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              handleRejectApplication(
                                application.application_id,
                              )
                            }
                          >
                            반려
                          </button>

                          <button
                            type="button"
                            className="admin-action cancel"
                            onClick={() =>
                              handleCancelApplication(
                                application.application_id,
                              )
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
    </section>
  );
}
