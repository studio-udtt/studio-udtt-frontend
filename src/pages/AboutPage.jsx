import { useEffect, useState } from "react";
import { getContents } from "../api/user/contentApi";
import { getSiteStats } from "../api/user/statApi";

export default function AboutPage() {
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const [contentResponse, statResponse] = await Promise.all([
          getContents({ status: "PUBLISHED" }),
          getSiteStats(),
        ]);

        setContents(contentResponse.data);
        setStats(statResponse.data);
      } catch (error) {
        console.error("회사소개 데이터 조회 실패:", error);
        setContents([]);
        setStats([]);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <main className="section">
      <div className="shell">
        <div className="about-head">
          <span className="eyebrow">ABOUT</span>
          <h1 className="h-display">
            우리는, 잘 만드는 것보다
            <br />
            함께 만드는 걸 더 중요하게 생각해요.
          </h1>
          <p className="lead">
            studio&amp;lab 우당탕탕은 지역의 빈 공간을 발견하고, 사람들과 함께
            고치고 운영하는 공간 프로젝트를 만듭니다.
          </p>
        </div>

        <div className="about-layout">
          <aside className="stats-panel">
            <div className="pre">UDANGTANGTANG SINCE 2021</div>
            <h3>지금까지의 우당탕탕</h3>

            {stats.length === 0 ? (
              <p className="stats-empty">누적 데이터를 불러오는 중입니다.</p>
            ) : (
              stats.map((stat) => (
                <div className="stat-row" key={stat.stat_key}>
                  <div className="n">
                    {stat.stat_value}
                    <span className="unit">+</span>
                  </div>
                  <div className="lbl">{stat.stat_label}</div>
                </div>
              ))
            )}
          </aside>

          <section className="articles">
            {contents.length === 0 ? (
              <article className="article">
                <div className="thumb" />
                <div>
                  <span className="source">CONTENTS</span>
                  <h4>게시된 콘텐츠를 불러오는 중입니다.</h4>
                  <p>
                    우당탕탕의 프로젝트 소식과 인터뷰가 이 영역에 표시됩니다.
                  </p>
                </div>
              </article>
            ) : (
              contents.map((content) => (
                <article className="article" key={content.content_id}>
                  <div
                    className="thumb"
                    style={{
                      backgroundImage: content.thumbnail_url
                        ? `url(${content.thumbnail_url})`
                        : undefined,
                    }}
                  />

                  <div>
                    <span className="source">
                      {content.content_type || content.source_name}
                    </span>
                    <h4>{content.title}</h4>
                    <p>{content.summary}</p>
                    <div className="date">{content.published_at}</div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
