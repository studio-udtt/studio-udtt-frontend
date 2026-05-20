import { useEffect, useState } from "react";
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
  { label: "승인 참여자", value: "APPROVED_PARTICIPANT" },
];

const initialSendForm = {
  target_type: "ALL",
  title: "",
  message: "",
  recipient_ids: [],
};

export default function AdminSmsPage() {
  const [targets, setTargets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);
  const [sendForm, setSendForm] = useState(initialSendForm);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const normalizeList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  const loadSmsData = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const [targetResponse, messageResponse] = await Promise.all([
        getSmsTargets({
          target_type: sendForm.target_type,
        }),
        getSmsMessages({
          page: 0,
          size: 30,
        }),
      ]);

      setTargets(normalizeList(targetResponse.data, "targets"));
      setMessages(normalizeList(messageResponse.data, "messages"));
    } catch (error) {
      console.error("문자 데이터 조회 실패:", error);
      setTargets([]);
      setMessages([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialSmsData = async () => {
      try {
        const [targetResponse, messageResponse] = await Promise.all([
          getSmsTargets({
            target_type: "ALL",
          }),
          getSmsMessages({
            page: 0,
            size: 30,
          }),
        ]);

        if (!ignore) {
          setTargets(normalizeList(targetResponse.data, "targets"));
          setMessages(normalizeList(messageResponse.data, "messages"));
        }
      } catch (error) {
        if (!ignore) {
          console.error("문자 데이터 조회 실패:", error);
          setTargets([]);
          setMessages([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialSmsData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSendFormChange = (event) => {
    const { name, value } = event.target;

    setSendForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "target_type") {
      setSelectedTargetIds([]);
    }
  };

  const handleTargetTypeSearch = async () => {
    try {
      setIsLoading(true);

      const response = await getSmsTargets({
        target_type: sendForm.target_type,
      });

      setTargets(normalizeList(response.data, "targets"));
      setSelectedTargetIds([]);
    } catch (error) {
      console.error("문자 대상 조회 실패:", error);
      setTargets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTarget = (targetId) => {
    setSelectedTargetIds((prev) => {
      if (prev.includes(targetId)) {
        return prev.filter((id) => id !== targetId);
      }

      return [...prev, targetId];
    });
  };

  const handleSelectAllTargets = () => {
    if (selectedTargetIds.length === targets.length) {
      setSelectedTargetIds([]);
      return;
    }

    setSelectedTargetIds(targets.map((target) => target.target_id));
  };

  const handleSendSms = async (event) => {
    event.preventDefault();

    if (!sendForm.title || !sendForm.message) {
      alert("제목과 문자 내용을 입력해 주세요.");
      return;
    }

    if (selectedTargetIds.length === 0) {
      alert("문자를 받을 대상을 선택해 주세요.");
      return;
    }

    const ok = window.confirm(
      `${selectedTargetIds.length}명에게 문자를 발송할까요?`,
    );
    if (!ok) return;

    const payload = {
      target_type: sendForm.target_type,
      title: sendForm.title,
      message: sendForm.message,
      recipient_ids: selectedTargetIds,
    };

    try {
      setIsSending(true);

      const response = await sendSmsMessage(payload);

      alert(response.data.message || "문자가 발송되었습니다.");

      setSendForm(initialSendForm);
      setSelectedTargetIds([]);
      loadSmsData({ showLoading: false });
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

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">SMS</span>
          <h1>문자 발송</h1>
          <p>의뢰자, 신청자, 승인 참여자에게 안내 문자를 발송합니다.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={() => loadSmsData()}
        >
          새로고침
        </button>
      </div>

      <div className="admin-sms-layout">
        <section className="admin-sms-send-card">
          <div className="admin-table-head inner">
            <h2>문자 작성</h2>
            <span>{selectedTargetIds.length}명 선택됨</span>
          </div>

          <form className="admin-sms-form" onSubmit={handleSendSms}>
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

                <button type="button" onClick={handleTargetTypeSearch}>
                  대상 조회
                </button>
              </div>
            </div>

            <div className="admin-field">
              <label>문자 제목 *</label>
              <input
                name="title"
                value={sendForm.title}
                onChange={handleSendFormChange}
                placeholder="예: 프로젝트 참여 승인 안내"
              />
            </div>

            <div className="admin-field">
              <label>문자 내용 *</label>
              <textarea
                name="message"
                value={sendForm.message}
                onChange={handleSendFormChange}
                placeholder="발송할 문자 내용을 입력하세요."
              />
            </div>

            <div className="sms-message-counter">
              {sendForm.message.length}자
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
            >
              {selectedTargetIds.length === targets.length
                ? "전체 해제"
                : "전체 선택"}
            </button>
          </div>

          {isLoading ? (
            <div className="admin-empty">문자 대상을 불러오는 중입니다.</div>
          ) : targets.length === 0 ? (
            <div className="admin-empty">조회된 발송 대상이 없습니다.</div>
          ) : (
            <div className="admin-target-list">
              {targets.map((target) => (
                <label className="admin-target-item" key={target.target_id}>
                  <input
                    type="checkbox"
                    checked={selectedTargetIds.includes(target.target_id)}
                    onChange={() => handleToggleTarget(target.target_id)}
                  />

                  <div>
                    <strong>
                      {target.name || target.target_name || "이름 없음"}
                    </strong>
                    <p>{target.phone || target.target_phone || "-"}</p>
                  </div>

                  <span>{target.target_type || sendForm.target_type}</span>
                </label>
              ))}
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
          <div className="admin-empty">문자 발송 이력이 없습니다.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제목</th>
                  <th>대상 유형</th>
                  <th>발송 수</th>
                  <th>상태</th>
                  <th>발송일</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => (
                  <tr key={message.sms_id}>
                    <td>{message.sms_id}</td>

                    <td className="admin-td-wide">
                      <strong className="admin-project-title">
                        {message.title}
                      </strong>
                      <p className="admin-project-summary">{message.message}</p>
                    </td>

                    <td>{message.target_type || "-"}</td>
                    <td>
                      {message.recipient_count || message.total_count || 0}명
                    </td>

                    <td>
                      <span
                        className={`admin-status ${message.status?.toLowerCase()}`}
                      >
                        {message.status || "-"}
                      </span>
                    </td>

                    <td>{message.created_at || message.sent_at || "-"}</td>

                    <td>
                      <button
                        type="button"
                        className="admin-action approve"
                        onClick={() => handleReadMessageDetail(message.sms_id)}
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
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
                <span>제목</span>
                <strong>{selectedMessageDetail.title}</strong>
              </div>

              <div>
                <span>내용</span>
                <p>{selectedMessageDetail.message}</p>
              </div>

              <div>
                <span>상태</span>
                <strong>{selectedMessageDetail.status}</strong>
              </div>

              <div>
                <span>발송일</span>
                <strong>
                  {selectedMessageDetail.created_at ||
                    selectedMessageDetail.sent_at ||
                    "-"}
                </strong>
              </div>
            </div>

            {selectedMessageDetail.recipients?.length > 0 && (
              <div className="admin-recipient-detail-list">
                <h3>수신자 목록</h3>

                {selectedMessageDetail.recipients.map((recipient) => (
                  <div
                    className="admin-recipient-detail-item"
                    key={recipient.recipient_id}
                  >
                    <span>{recipient.name || recipient.recipient_name}</span>
                    <strong>
                      {recipient.phone || recipient.recipient_phone}
                    </strong>
                    <em>{recipient.status}</em>
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
