import axiosInstance from "../axiosInstance";

// 누적 데이터 목록 조회
export const getAdminSiteStats = () => {
  return axiosInstance.get("/api/v1/admin/site-stats");
};

// 누적 데이터 추가
export const createAdminSiteStat = (data) => {
  return axiosInstance.post("/api/v1/admin/site-stats", data);
};

// 누적 데이터 수정
export const updateAdminSiteStat = (statId, data) => {
  return axiosInstance.patch(`/api/v1/admin/site-stats/${statId}`, data);
};

// 누적 데이터 삭제
export const deleteAdminSiteStat = (statId) => {
  return axiosInstance.delete(`/api/v1/admin/site-stats/${statId}`);
};

// 관리자 통계 요약 조회
export const getAdminStatisticsSummary = () => {
  return axiosInstance.get("/api/v1/admin/statistics/summary");
};

// 프로젝트별 통계 조회
export const getAdminProjectStatistics = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/statistics/projects", {
    params,
  });
};
