import { useEffect, useState } from "react";
import { getAdminProjects } from "../../api/admin/adminProjectApi";
import {
  getSmsMessageDetail,
  getSmsMessages,
  getSmsTargets,
  sendSmsMessage,
} from "../../api/admin/adminSmsApi";

const TARGET_TYPE_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "의뢰자", value: "REQUESTER" },
  { label: "참여 신청자", value: "APPLICANT" },
];

const TARGET_TYPE_LABELS = {
  ALL: "전체",
  REQUESTER: "의뢰자",
  APPLICANT: "참여 신청자",
  CUSTOM: "직접 선택",
};

const initialSendForm = {
  project_id: "",
  target_type: "ALL",
  sender_number: "",
  message_content: "",
};

const normalizeList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.data?.[key])) return data.data[key];

  return [];
};

const getTargetId = (target) => {
  return (
    target.target_id ??
    target.targetId ??
    target.recipient_id ??
    target.recipientId ??
    target.reference_id ??
    target.referenceId ??
    target.request_id ??
    target.requestId ??
    target.application_id ??
    target.applicationId ??
    target.id
  );
};

const getTargetName = (target) => {
  return (
    target.name ??
    target.target_name ??
    target.targetName ??
    target.recipient_name ??
    target.recipientName ??
    target.requester_name ??
    target.requesterName ??
    target.applicant_name ??
    target.applicantName ??
    "-"
  );
};

const getTargetPhone = (target) => {
  return (
    target.phone ??
    target.target_phone ??
    target.targetPhone ??
    target.recipient_phone ??
    target.recipientPhone ??
    target.requester_phone ??
    target.requesterPhone ??
    target.applicant_phone ??
    target.applicantPhone ??
    "-"
  );
};

const getTargetType = (target, fallbackType) => {
  return (
    target.target_type ??
    target.targetType ??
    target.recipient_type ??
    target.recipientType ??
    fallbackType
  );
};

const getTargetKey = (target, fallbackType) => {
  const type = getTargetType(target, fallbackType);
  const id = getTargetId(target);
  const phone = getTargetPhone(target);

  return `${type}-${id ?? phone}`;
};

const removeDuplicateTargets = (list) => {
  const map = new Map();

  list.forEach((target) => {
    const key = getTargetKey(target, target.target_type);

    if (!map.has(key)) {
      map.set(key, target);
    }
  });

  return Array.from(map.values());
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMessageContent = (message) => {
  return (
    message.message_content ??
    message.messageContent ??
    message.message ??
    message.content ??
    "-"
  );
};

const getSenderNumber = (message) => {
  return message.sender_number ?? message.senderNumber ?? "-";
};

const getTotalCount = (message) => {
  return (
    message.total_count ?? message.totalCount ?? message.recipient_count ?? 0
  );
};

const getSuccessCount = (message) => {
  return message.success_count ?? message.successCount ?? 0;
};

const getFailCount = (message) => {
  return message.fail_count ?? message.failCount ?? 0;
};

const getSentAt = (message) => {
  return (
    message.sent_at ?? message.sentAt ?? message.created_at ?? message.createdAt
  );
};

const getSmsId = (message) => {
  return message.sms_id ?? message.smsId ?? message.id;
};

export default function AdminSmsPage() {
  const [projects, setProjects] = useState([]);
  const [targets, setTargets] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedTargetKeys, setSelectedTargetKeys] = useState([]);
  const [sendForm, setSendForm] = useState(initialSendForm);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isTargetLoading, setIsTargetLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadProjects = async () => {
    const response = await getAdminProjects({
      page: 0,
      size: 100,
    });

    return normalizeList(response.data, "projects");
  };

  const loadMessages = async () => {
    const response = await getSmsMessages({
      page: 0,
      size: 30,
    });

    return normalizeList(response.data, "messages");
  };

  const getTargetParams = (targetType, projectId) => {
    return {
      target_type: targetType,
      project_id: projectId,
      sms_agreed: true,
    };
  };

  const loadSmsTargets = async (targetType, projectId) => {
    if (!projectId) {
      alert("프로젝트를 먼저 선택해 주세요.");
      return [];
    }

    if (targetType === "ALL") {
      const [requesterResponse, applicantResponse] = await Promise.all([
        getSmsTargets(getTargetParams("REQUESTER", projectId)),
        getSmsTargets(getTargetParams("APPLICANT", projectId)),
      ]);

      const requesterTargets = normalizeList(
        requesterResponse.data,
        "targets",
      ).map((target) => ({
        ...target,
        target_type: getTargetType(target, "REQUESTER"),
      }));

      const applicantTargets = normalizeList(
        applicantResponse.data,
        "targets",
      ).map((target) => ({
        ...target,
        target_type: getTargetType(target, "APPLICANT"),
      }));

      return removeDuplicateTargets([...requesterTargets, ...applicantTargets]);
    }

    const response = await getSmsTargets(
      getTargetParams(targetType, projectId),
    );

    return normalizeList(response.data, "targets").map((target) => ({
      ...target,
      target_type: getTargetType(target, targetType),
    }));
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const [projectList, messageList] = await Promise.all([
        loadProjects(),
        loadMessages(),
      ]);

      setProjects(projectList);
      setMessages(messageList);

      if (projectList.length > 0) {
        setSendForm((prev) => ({
          ...prev,
          project_id: String(projectList[0].project_id),
        }));
      }
    } catch (error) {
      console.error("문자 페이지 초기 데이터 조회 실패:", error);
      setProjects([]);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      try {
        setIsLoading(true);

        const [projectList, messageList] = await Promise.all([
          loadProjects(),
          loadMessages(),
        ]);

        if (!ignore) {
          setProjects(projectList);
          setMessages(messageList);

          if (projectList.length > 0) {
            setSendForm((prev) => ({
              ...prev,
              project_id: String(projectList[0].project_id),
            }));
          }
        }
      } catch (error) {
        if (!ignore) {
          console.error("문자 페이지 초기 데이터 조회 실패:", error);
          setProjects([]);
          setMessages([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    await loadInitialData();
    setTargets([]);
    setSelectedTargetKeys([]);
  };

  const handleSendFormChange = (event) => {
    const { name, value } = event.target;

    setSendForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "project_id" || name === "target_type") {
      setTargets([]);
      setSelectedTargetKeys([]);
    }
  };

  const handleTargetTypeSearch = async () => {
    try {
      setIsTargetLoading(true);

      const targetList = await loadSmsTargets(
        sendForm.target_type,
        sendForm.project_id,
      );

      console.log("문자 대상 응답:", targetList);

      setTargets(targetList);
      setSelectedTargetKeys([]);
    } catch (error) {
      console.error("문자 대상 조회 실패:", error);
      setTargets([]);
      alert("문자 대상 조회 중 오류가 발생했습니다.");
    } finally {
      setIsTargetLoading(false);
    }
  };

  const handleToggleTarget = (target) => {
    const key = getTargetKey(target, sendForm.target_type);

    setSelectedTargetKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key);
      }

      return [...prev, key];
    });
  };

  const handleSelectAllTargets = () => {
    if (targets.length === 0) return;

    if (selectedTargetKeys.length === targets.length) {
      setSelectedTargetKeys([]);
      return;
    }

    setSelectedTargetKeys(
      targets.map((target) => getTargetKey(target, sendForm.target_type)),
    );
  };

  const getSelectedTargets = () => {
    const selectedKeySet = new Set(selectedTargetKeys);

    return targets.filter((target) =>
      selectedKeySet.has(getTargetKey(target, sendForm.target_type)),
    );
  };

  const getRequestTargetType = (selectedTargets) => {
    const types = new Set(
      selectedTargets.map((target) =>
        getTargetType(target, sendForm.target_type),
      ),
    );

    if (types.size === 1 && types.has("REQUESTER")) {
      return "REQUESTER";
    }

    if (types.size === 1 && types.has("APPLICANT")) {
      return "APPLICANT";
    }

    return "CUSTOM";
  };

  const buildRecipients = (selectedTargets) => {
    return selectedTargets.map((target) => {
      const recipientType = getTargetType(target, sendForm.target_type);
      const referenceId = getTargetId(target);
      const recipientName = getTargetName(target);
      const phone = getTargetPhone(target);

      return {
        recipient_type: recipientType,
        reference_id: referenceId,
        recipient_name: recipientName,
        phone,
      };
    });
  };

  const handleSendSms = async (event) => {
    event.preventDefault();

    if (!sendForm.project_id) {
      alert("프로젝트를 먼저 선택해 주세요.");
      return;
    }

    if (!sendForm.sender_number.trim()) {
      alert("발신번호를 입력해 주세요.");
      return;
    }

    if (!sendForm.message_content.trim()) {
      alert("문자 내용을 입력해 주세요.");
      return;
    }

    const selectedTargets = getSelectedTargets();

    if (selectedTargets.length === 0) {
      alert("문자를 받을 대상을 선택해 주세요.");
      return;
    }

    const recipients = buildRecipients(selectedTargets);

    const invalidRecipient = recipients.find(
      (recipient) =>
        !recipient.recipient_type ||
        recipient.reference_id === undefined ||
        recipient.reference_id === null ||
        !recipient.phone ||
        recipient.phone === "-",
    );

    if (invalidRecipient) {
      alert("선택된 대상의 이름, 연락처 또는 ID 정보가 올바르지 않습니다.");
      console.log("잘못된 수신자:", invalidRecipient);
      console.log("선택된 대상:", selectedTargets);
      return;
    }

    const ok = window.confirm(`${recipients.length}명에게 문자를 발송할까요?`);

    if (!ok) return;

    const payload = {
      target_type: getRequestTargetType(selectedTargets),
      sender_number: sendForm.sender_number,
      message_content: sendForm.message_content,
      recipients,
    };

    console.log("문자 발송 payload:", payload);

    try {
      setIsSending(true);

      const response = await sendSmsMessage(payload);

      alert(response.data.message || "문자가 발송되었습니다.");

      setSendForm((prev) => ({
        ...prev,
        message_content: "",
      }));

      setSelectedTargetKeys([]);

      const messageList = await loadMessages();
      setMessages(messageList);
    } catch (error) {
      console.error("문자 발송 실패:", error);
      alert("문자 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReadMessageDetail = async (smsId) => {
    try {
      const response = await getSmsMessageDetail(smsId);
      setSelectedMessageDetail(response.data);
    } catch (error) {
      console.error("문자 상세 조회 실패:", error);
      alert("문자 상세 조회 중 오류가 발생했습니다.");
    }
  };

  const closeDetailModal = () => {
    setSelectedMessageDetail(null);
  };

  const detailMessageContent =
    selectedMessageDetail?.message_content ??
    selectedMessageDetail?.messageContent ??
    selectedMessageDetail?.message ??
    "-";

  const detailRecipients =
    selectedMessageDetail?.recipients ??
    selectedMessageDetail?.recipientResponses ??
    [];

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">SMS</span>
          <h1>문자 발송</h1>
          <p>
            프로젝트를 선택한 뒤 의뢰자 또는 참여 신청자에게 문자를 발송합니다.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={handleRefresh}
        >
          새로고침
        </button>
      </div>

      <div className="admin-sms-layout">
        <section className="admin-sms-send-card">
          <div className="admin-table-head inner">
            <h2>문자 작성</h2>
            <span>{selectedTargetKeys.length}명 선택됨</span>
          </div>

          <form className="admin-sms-form" onSubmit={handleSendSms}>
            <div className="admin-field">
              <label>프로젝트 선택 *</label>
              <select
                name="project_id"
                value={sendForm.project_id}
                onChange={handleSendFormChange}
              >
                {projects.length === 0 ? (
                  <option value="">등록된 프로젝트가 없습니다</option>
                ) : (
                  projects.map((project) => (
                    <option
                      value={String(project.project_id)}
                      key={project.project_id}
                    >
                      {project.title || `프로젝트 ${project.project_id}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="admin-field">
              <label>발송 대상 유형</label>

              <div className="admin-inline-field">
                <select
                  name="target_type"
                  value={sendForm.target_type}
                  onChange={handleSendFormChange}
                >
                  {TARGET_TYPE_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleTargetTypeSearch}
                  disabled={isTargetLoading || !sendForm.project_id}
                >
                  {isTargetLoading ? "조회 중..." : "대상 조회"}
                </button>
              </div>
            </div>

            <div className="admin-field">
              <label>발신번호 *</label>
              <input
                name="sender_number"
                value={sendForm.sender_number}
                onChange={handleSendFormChange}
                placeholder="예: 010-1234-5678"
              />
            </div>

            <div className="admin-field">
              <label>문자 내용 *</label>
              <textarea
                name="message_content"
                value={sendForm.message_content}
                onChange={handleSendFormChange}
                placeholder="발송할 문자 내용을 입력하세요."
              />
            </div>

            <div className="sms-message-counter">
              {sendForm.message_content.length}자
            </div>

            <button
              type="submit"
              className="admin-send-btn"
              disabled={isSending}
            >
              {isSending ? "발송 중..." : "선택 대상에게 문자 발송"}
            </button>
          </form>
        </section>

        <section className="admin-sms-target-card">
          <div className="admin-table-head inner">
            <h2>발송 대상</h2>

            <button
              type="button"
              className="admin-small-btn"
              onClick={handleSelectAllTargets}
              disabled={targets.length === 0}
            >
              {targets.length > 0 &&
              selectedTargetKeys.length === targets.length
                ? "전체 해제"
                : "전체 선택"}
            </button>
          </div>

          {isLoading || isTargetLoading ? (
            <div className="admin-empty admin-table-empty">
              문자 대상을 불러오는 중입니다.
            </div>
          ) : targets.length === 0 ? (
            <div className="admin-empty admin-table-empty">
              프로젝트와 대상 유형을 선택한 뒤 대상 조회를 눌러주세요.
            </div>
          ) : (
            <div className="admin-target-list">
              {targets.map((target) => {
                const key = getTargetKey(target, sendForm.target_type);
                const type = getTargetType(target, sendForm.target_type);

                return (
                  <label className="admin-target-item" key={key}>
                    <input
                      type="checkbox"
                      checked={selectedTargetKeys.includes(key)}
                      onChange={() => handleToggleTarget(target)}
                    />

                    <div>
                      <strong>{getTargetName(target)}</strong>
                      <p>{getTargetPhone(target)}</p>
                    </div>

                    <span>{TARGET_TYPE_LABELS[type] || type || "-"}</span>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="admin-table-card">
        <div className="admin-table-head">
          <h2>문자 발송 이력</h2>
          <span>{messages.length}건</span>
        </div>

        {messages.length === 0 ? (
          <div className="admin-empty admin-table-empty">
            문자 발송 이력이 없습니다.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>문자 내용</th>
                  <th>대상 유형</th>
                  <th>발신번호</th>
                  <th>발송 수</th>
                  <th>성공/실패</th>
                  <th>발송일</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => {
                  const smsId = getSmsId(message);

                  return (
                    <tr key={smsId}>
                      <td className="admin-td-wide">
                        <strong className="admin-project-title">
                          {getMessageContent(message)}
                        </strong>
                      </td>

                      <td>
                        {TARGET_TYPE_LABELS[
                          message.target_type ?? message.targetType
                        ] ||
                          message.target_type ||
                          message.targetType ||
                          "-"}
                      </td>

                      <td>{getSenderNumber(message)}</td>

                      <td>{getTotalCount(message)}명</td>

                      <td>
                        {getSuccessCount(message)} / {getFailCount(message)}
                      </td>

                      <td>{formatDateTime(getSentAt(message))}</td>

                      <td>
                        <button
                          type="button"
                          className="admin-action approve"
                          onClick={() => handleReadMessageDetail(smsId)}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedMessageDetail && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-eyebrow">SMS DETAIL</span>
                <h2>문자 발송 상세</h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeDetailModal}
              >
                ×
              </button>
            </div>

            <div className="admin-sms-detail">
              <div>
                <span>내용</span>
                <p>{detailMessageContent}</p>
              </div>
            </div>

            {detailRecipients.length > 0 && (
              <div className="admin-recipient-detail-list">
                <h3>수신자 목록</h3>

                {detailRecipients.map((recipient) => (
                  <div
                    className="admin-recipient-detail-item"
                    key={
                      recipient.recipient_id ??
                      recipient.recipientId ??
                      recipient.id
                    }
                  >
                    <span>
                      {recipient.recipient_name ??
                        recipient.recipientName ??
                        recipient.name ??
                        "-"}
                    </span>
                    <strong>
                      {recipient.phone ?? recipient.recipient_phone ?? "-"}
                    </strong>
                    <em>
                      {recipient.status ??
                        recipient.send_status ??
                        recipient.sendStatus ??
                        "-"}
                    </em>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
