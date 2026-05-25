import axiosInstance from "../axiosInstance";

// 관리자 로그인
export const adminLogin = (data) => {
  return axiosInstance.post("/api/v1/admin/auth/login", data);
};

// 관리자 로그아웃
export const adminLogout = () => {
  return axiosInstance.post("/api/v1/admin/auth/logout");
};

// 현재 로그인 관리자 조회
export const getCurrentAdmin = () => {
  return axiosInstance.get("/api/v1/admin/auth/me");
};
