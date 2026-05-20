import axiosInstance from "../axiosInstance";

// 비회원 프로젝트 참여 신청
export const createApplication = (projectId, data) => {
  return axiosInstance.post(`/api/v1/projects/${projectId}/applications`, data);
};

// 참여 신청 상태 조회
export const getApplicationStatus = (applicationId) => {
  return axiosInstance.get(`/api/v1/applications/${applicationId}`);
};
