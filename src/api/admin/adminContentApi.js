import axiosInstance from "../axiosInstance";

// 콘텐츠 목록 조회
export const getAdminContents = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/contents", {
    params,
  });
};

// 콘텐츠 수동 등록
export const createAdminContent = (data) => {
  return axiosInstance.post("/api/v1/admin/contents", data);
};

// 콘텐츠 상세 조회
export const getAdminContentDetail = (contentId) => {
  return axiosInstance.get(`/api/v1/admin/contents/${contentId}`);
};

// 콘텐츠 수정
export const updateAdminContent = (contentId, data) => {
  return axiosInstance.patch(`/api/v1/admin/contents/${contentId}`, data);
};

// 콘텐츠 게시 상태 변경
export const updateAdminContentStatus = (contentId, data) => {
  return axiosInstance.patch(
    `/api/v1/admin/contents/${contentId}/status`,
    data,
  );
};

// 콘텐츠 삭제
export const deleteAdminContent = (contentId) => {
  return axiosInstance.delete(`/api/v1/admin/contents/${contentId}`);
};

// 콘텐츠 자동 수집 실행
export const crawlAdminContents = (data) => {
  return axiosInstance.post("/api/v1/admin/contents/crawl", data);
};
