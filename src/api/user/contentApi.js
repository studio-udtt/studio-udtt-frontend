import axiosInstance from "../axiosInstance";

// 게시된 콘텐츠 목록 조회
export const getContents = (params = {}) => {
  return axiosInstance.get("/api/v1/contents", {
    params,
  });
};

// 콘텐츠 상세 조회
export const getContentDetail = (contentId) => {
  return axiosInstance.get(`/api/v1/contents/${contentId}`);
};
