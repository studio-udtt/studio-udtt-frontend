import axiosInstance from "../axiosInstance";

// 비회원 프로젝트 의뢰 신청
export const createProjectRequest = (data) => {
  return axiosInstance.post("/api/v1/project-requests", data);
};

// 의뢰 신청 상태 조회
export const getProjectRequestStatus = (requestId) => {
  return axiosInstance.get(`/api/v1/project-requests/${requestId}`);
};
