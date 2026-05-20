import axiosInstance from "../axiosInstance";

// 문자 발송 대상 조회
export const getSmsTargets = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/sms/targets", {
    params,
  });
};

// 문자 일괄 발송
export const sendSmsMessage = (data) => {
  return axiosInstance.post("/api/v1/admin/sms/messages", data);
};

// 문자 발송 이력 조회
export const getSmsMessages = (params = {}) => {
  return axiosInstance.get("/api/v1/admin/sms/messages", {
    params,
  });
};

// 문자 발송 상세 조회
export const getSmsMessageDetail = (smsId) => {
  return axiosInstance.get(`/api/v1/admin/sms/messages/${smsId}`);
};
