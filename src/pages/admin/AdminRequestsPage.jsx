import { useEffect, useState } from "react";
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

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState("projectRequests");
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

      setProjectRequests(projectRequestResponse.data);
      setApplications(applicationResponse.data);
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

        if (!ignore) {
          setProjectRequests(projectRequestResponse.data);
          setApplications(applicationResponse.data);
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

  const handleApproveProjectRequest = async (requestId) => {
    const title = window.prompt("프로젝트 제목을 입력하세요.");
    if (!title) return;

    const summary = window.prompt("프로젝트 요약을 입력하세요.");
    if (!summary) return;

    const maxParticipantsInput = window.prompt(
      "최대 참여 인원을 입력하세요.",
      "20",
    );
    const maxParticipants = Number(maxParticipantsInput || 20);

    const payload = {
      title,
      summary,
      description: summary,
      recruit_start_date: "2026-06-01",
      recruit_end_date: "2026-06-10",
      project_start_date: "2026-06-15",
      project_end_date: "2026-07-05",
      max_participants: maxParticipants,
      latitude: 37.5665,
      longitude: 126.978,
      is_visible: true,
    };

    try {
      const response = await approveProjectRequest(requestId, payload);
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

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">REQUESTS</span>
          <h1>신청 관리</h1>
          <p>프로젝트 의뢰 신청과 참여 신청을 승인하거나 반려합니다.</p>
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
          onClick={() => setActiveTab("projectRequests")}
        >
          의뢰 신청
        </button>

        <button
          type="button"
          className={activeTab === "applications" ? "active" : ""}
          onClick={() => setActiveTab("applications")}
        >
          참여 신청
        </button>
      </div>

      {isLoading && (
        <div className="admin-empty">목록을 불러오는 중입니다.</div>
      )}

      {!isLoading && activeTab === "projectRequests" && (
        <section className="admin-table-card">
          <div className="admin-table-head">
            <h2>의뢰 신청 목록</h2>
            <span>{projectRequests.length}건</span>
          </div>

          {projectRequests.length === 0 ? (
            <div className="admin-empty">등록된 의뢰 신청이 없습니다.</div>
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
                  {projectRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>{request.request_id}</td>
                      <td>{request.requester_name}</td>
                      <td>{request.requester_phone}</td>
                      <td className="admin-td-wide">{request.space_address}</td>
                      <td>{request.project_type}</td>
                      <td>
                        <span
                          className={`admin-status ${request.status?.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>{request.created_at}</td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action approve"
                            onClick={() =>
                              handleApproveProjectRequest(request.request_id)
                            }
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
            <span>{applications.length}건</span>
          </div>

          {applications.length === 0 ? (
            <div className="admin-empty">등록된 참여 신청이 없습니다.</div>
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
                  {applications.map((application) => (
                    <tr key={application.application_id}>
                      <td>{application.application_id}</td>
                      <td className="admin-td-wide">
                        {application.project_title}
                      </td>
                      <td>{application.applicant_name}</td>
                      <td>{application.applicant_phone}</td>
                      <td>{application.job}</td>
                      <td>
                        <span
                          className={`admin-status ${application.status?.toLowerCase()}`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td>{application.created_at}</td>
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
