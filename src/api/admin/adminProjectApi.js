import axiosInstance from "../axiosInstance";

// 프로젝트 목록 조회
export const getAdminProjects = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/projects", {
    params,
  });
};

// 프로젝트 상세 조회
export const getAdminProjectDetail = (projectId) => {
  return axiosInstance.get(`/api/v1/admin/projects/${projectId}`);
};

// 프로젝트 정보 수정
export const updateAdminProject = (projectId, data) => {
  return axiosInstance.patch(`/api/v1/admin/projects/${projectId}`, data);
};

// 프로젝트 상태 변경
export const updateAdminProjectStatus = (projectId, data) => {
  return axiosInstance.patch(
    `/api/v1/admin/projects/${projectId}/status`,
    data,
  );
};

// 프로젝트 삭제 또는 취소
export const deleteAdminProject = (projectId) => {
  return axiosInstance.delete(`/api/v1/admin/projects/${projectId}`);
};
