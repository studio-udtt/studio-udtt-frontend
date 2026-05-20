import axiosInstance from "../axiosInstance";

// 의뢰 목록 조회
export const getAdminProjectRequests = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/project-requests", {
    params,
  });
};

// 의뢰 상세 조회
export const getAdminProjectRequestDetail = (requestId) => {
  return axiosInstance.get(`/api/v1/admin/project-requests/${requestId}`);
};

// 의뢰 승인 및 프로젝트 생성
export const approveProjectRequest = (requestId, data) => {
  return axiosInstance.patch(
    `/api/v1/admin/project-requests/${requestId}/approve`,
    data,
  );
};

// 의뢰 반려
export const rejectProjectRequest = (requestId, data) => {
  return axiosInstance.patch(
    `/api/v1/admin/project-requests/${requestId}/reject`,
    data,
  );
};

// 의뢰 취소 처리
export const cancelProjectRequest = (requestId) => {
  return axiosInstance.patch(
    `/api/v1/admin/project-requests/${requestId}/cancel`,
  );
};
