import axiosInstance from "../axiosInstance";

// 사용자 누적 데이터 조회
export const getSiteStats = () => {
  return axiosInstance.get("/api/v1/site-stats");
};
