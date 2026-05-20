import axiosInstance from "../axiosInstance";

// 참여 신청 목록 조회
export const getAdminApplications = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/applications", {
    params,
  });
};

// 참여 신청 상세 조회
export const getAdminApplicationDetail = (applicationId) => {
  return axiosInstance.get(`/api/v1/admin/applications/${applicationId}`);
};

// 참여 신청 승인
export const approveApplication = (applicationId) => {
  return axiosInstance.patch(
    `/api/v1/admin/applications/${applicationId}/approve`,
  );
};

// 참여 신청 반려
export const rejectApplication = (applicationId, data) => {
  return axiosInstance.patch(
    `/api/v1/admin/applications/${applicationId}/reject`,
    data,
  );
};

// 참여 신청 취소 처리
export const cancelApplication = (applicationId) => {
  return axiosInstance.patch(
    `/api/v1/admin/applications/${applicationId}/cancel`,
  );
};
