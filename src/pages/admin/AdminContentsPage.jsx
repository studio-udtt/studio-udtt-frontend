import { useEffect, useState } from "react";
import {
  crawlAdminContents,
  createAdminContent,
  deleteAdminContent,
  getAdminContents,
  updateAdminContent,
  updateAdminContentStatus,
} from "../../api/admin/adminContentApi";

const CONTENT_STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "HIDDEN"];
const CONTENT_TYPE_OPTIONS = ["NEWS", "INTERVIEW", "PROJECT", "NOTICE"];

const initialForm = {
  title: "",
  summary: "",
  content: "",
  source_name: "",
  source_url: "",
  thumbnail_url: "",
  content_type: "NEWS",
  status: "DRAFT",
  published_at: "",
};

const initialCrawlForm = {
  source_name: "studio&lab 우당탕탕",
  source_url: "",
  content_type: "NEWS",
};

export default function AdminContentsPage() {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [crawlForm, setCrawlForm] = useState(initialCrawlForm);
  const [isCrawling, setIsCrawling] = useState(false);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.contents)) return data.contents;
    return [];
  };

  const loadContents = async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const response = await getAdminContents({
        page: 0,
        size: 50,
      });

      setContents(normalizeList(response.data));
    } catch (error) {
      console.error("관리자 콘텐츠 목록 조회 실패:", error);
      setContents([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialContents = async () => {
      try {
        const response = await getAdminContents({
          page: 0,
          size: 50,
        });

        if (!ignore) {
          setContents(normalizeList(response.data));
        }
      } catch (error) {
        if (!ignore) {
          console.error("관리자 콘텐츠 목록 조회 실패:", error);
          setContents([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInitialContents();

    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingContent(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (content) => {
    setEditingContent(content);
    setForm({
      title: content.title || "",
      summary: content.summary || "",
      content: content.content || "",
      source_name: content.source_name || "",
      source_url: content.source_url || "",
      thumbnail_url: content.thumbnail_url || "",
      content_type: content.content_type || "NEWS",
      status: content.status || "DRAFT",
      published_at: content.published_at || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingContent(null);
    setForm(initialForm);
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCrawlFormChange = (event) => {
    const { name, value } = event.target;

    setCrawlForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitContent = async (event) => {
    event.preventDefault();

    if (!form.title || !form.summary) {
      alert("제목과 요약은 필수입니다.");
      return;
    }

    try {
      if (editingContent) {
        const response = await updateAdminContent(
          editingContent.content_id,
          form,
        );

        alert(response.data.message || "콘텐츠가 수정되었습니다.");
      } else {
        const response = await createAdminContent(form);

        alert(response.data.message || "콘텐츠가 등록되었습니다.");
      }

      closeModal();
      loadContents({ showLoading: false });
    } catch (error) {
      console.error("콘텐츠 저장 실패:", error);
      alert("콘텐츠 저장 중 오류가 발생했습니다.");
    }
  };

  const handleStatusChange = async (contentId, status) => {
    const ok = window.confirm(`콘텐츠 상태를 ${status}(으)로 변경할까요?`);
    if (!ok) return;

    try {
      const response = await updateAdminContentStatus(contentId, {
        status,
      });

      alert(response.data.message || "콘텐츠 상태가 변경되었습니다.");
      loadContents({ showLoading: false });
    } catch (error) {
      console.error("콘텐츠 상태 변경 실패:", error);
      alert("콘텐츠 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteContent = async (contentId) => {
    const ok = window.confirm("이 콘텐츠를 삭제할까요?");
    if (!ok) return;

    try {
      const response = await deleteAdminContent(contentId);
      alert(response.data.message || "콘텐츠가 삭제되었습니다.");
      loadContents({ showLoading: false });
    } catch (error) {
      console.error("콘텐츠 삭제 실패:", error);
      alert("콘텐츠 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCrawlContents = async (event) => {
    event.preventDefault();

    if (!crawlForm.source_name) {
      alert("수집 키워드 또는 출처명을 입력해 주세요.");
      return;
    }

    try {
      setIsCrawling(true);

      const response = await crawlAdminContents(crawlForm);

      alert(response.data.message || "콘텐츠 자동 수집이 실행되었습니다.");
      loadContents({ showLoading: false });
    } catch (error) {
      console.error("콘텐츠 자동 수집 실패:", error);
      alert("콘텐츠 자동 수집 중 오류가 발생했습니다.");
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div>
          <span className="admin-eyebrow">CONTENTS</span>
          <h1>콘텐츠 관리</h1>
          <p>게시 콘텐츠를 등록, 수정, 삭제하고 자동 수집을 실행합니다.</p>
        </div>

        <div className="admin-head-actions">
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => loadContents()}
          >
            새로고침
          </button>

          <button
            type="button"
            className="admin-create-btn"
            onClick={openCreateModal}
          >
            콘텐츠 등록
          </button>
        </div>
      </div>

      <section className="admin-crawl-card">
        <div>
          <h2>콘텐츠 자동 수집</h2>
          <p>고정 키워드 또는 출처 링크를 기준으로 콘텐츠 수집을 실행합니다.</p>
        </div>

        <form className="admin-crawl-form" onSubmit={handleCrawlContents}>
          <input
            name="source_name"
            value={crawlForm.source_name}
            onChange={handleCrawlFormChange}
            placeholder="검색 키워드 또는 출처명"
          />

          <input
            name="source_url"
            value={crawlForm.source_url}
            onChange={handleCrawlFormChange}
            placeholder="출처 URL 선택 입력"
          />

          <select
            name="content_type"
            value={crawlForm.content_type}
            onChange={handleCrawlFormChange}
          >
            {CONTENT_TYPE_OPTIONS.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>

          <button type="submit" disabled={isCrawling}>
            {isCrawling ? "수집 중..." : "자동 수집 실행"}
          </button>
        </form>
      </section>

      {isLoading ? (
        <div className="admin-empty">콘텐츠 목록을 불러오는 중입니다.</div>
      ) : (
        <section className="admin-table-card">
          <div className="admin-table-head">
            <h2>콘텐츠 목록</h2>
            <span>{contents.length}건</span>
          </div>

          {contents.length === 0 ? (
            <div className="admin-empty">등록된 콘텐츠가 없습니다.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>콘텐츠</th>
                    <th>유형</th>
                    <th>출처</th>
                    <th>상태</th>
                    <th>게시일</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>
                  {contents.map((content) => (
                    <tr key={content.content_id}>
                      <td>{content.content_id}</td>

                      <td className="admin-td-wide">
                        <strong className="admin-project-title">
                          {content.title}
                        </strong>
                        <p className="admin-project-summary">
                          {content.summary}
                        </p>
                      </td>

                      <td>{content.content_type || "-"}</td>

                      <td>
                        {content.source_url ? (
                          <a
                            href={content.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-source-link"
                          >
                            {content.source_name || "원문 보기"}
                          </a>
                        ) : (
                          content.source_name || "-"
                        )}
                      </td>

                      <td>
                        <select
                          className="admin-status-select"
                          value={content.status || ""}
                          onChange={(event) =>
                            handleStatusChange(
                              content.content_id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="" disabled>
                            상태 선택
                          </option>
                          {CONTENT_STATUS_OPTIONS.map((status) => (
                            <option value={status} key={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>{content.published_at || "-"}</td>

                      <td>
                        <div className="admin-action-group">
                          <button
                            type="button"
                            className="admin-action approve"
                            onClick={() => openEditModal(content)}
                          >
                            수정
                          </button>

                          <button
                            type="button"
                            className="admin-action reject"
                            onClick={() =>
                              handleDeleteContent(content.content_id)
                            }
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <section className="admin-modal">
            <div className="admin-modal-head">
              <div>
                <span className="admin-eyebrow">
                  {editingContent ? "EDIT CONTENT" : "CREATE CONTENT"}
                </span>
                <h2>{editingContent ? "콘텐츠 수정" : "콘텐츠 등록"}</h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="admin-edit-form" onSubmit={handleSubmitContent}>
              <div className="admin-field">
                <label>제목 *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="콘텐츠 제목"
                />
              </div>

              <div className="admin-field">
                <label>요약 *</label>
                <input
                  name="summary"
                  value={form.summary}
                  onChange={handleFormChange}
                  placeholder="콘텐츠 요약"
                />
              </div>

              <div className="admin-field">
                <label>본문</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleFormChange}
                  placeholder="콘텐츠 본문"
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>콘텐츠 유형</label>
                  <select
                    name="content_type"
                    value={form.content_type}
                    onChange={handleFormChange}
                  >
                    {CONTENT_TYPE_OPTIONS.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>상태</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {CONTENT_STATUS_OPTIONS.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>출처명</label>
                  <input
                    name="source_name"
                    value={form.source_name}
                    onChange={handleFormChange}
                    placeholder="출처명"
                  />
                </div>

                <div className="admin-field">
                  <label>게시일</label>
                  <input
                    type="datetime-local"
                    name="published_at"
                    value={form.published_at}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>출처 URL</label>
                <input
                  name="source_url"
                  value={form.source_url}
                  onChange={handleFormChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="admin-field">
                <label>썸네일 URL</label>
                <input
                  name="thumbnail_url"
                  value={form.thumbnail_url}
                  onChange={handleFormChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeModal}
                >
                  취소
                </button>

                <button type="submit" className="admin-save-btn">
                  {editingContent ? "수정 저장" : "등록하기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
