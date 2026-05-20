import axiosInstance from "../axiosInstance";

// 지도 기반 프로젝트 현황 조회
export const getProjectMap = (params = {}) => {
  return axiosInstance.get("/api/v1/projects/map", {
    params,
  });
};

// 모집 중 프로젝트 목록 조회
export const getProjects = (params = {}) => {
  return axiosInstance.get("/api/v1/projects", {
    params,
  });
};

// 프로젝트 상세 조회
export const getProjectDetail = (projectId) => {
  return axiosInstance.get(`/api/v1/projects/${projectId}`);
};
