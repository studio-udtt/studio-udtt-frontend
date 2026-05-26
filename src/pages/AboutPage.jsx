import chaAramImage from "../assets/images/cha-aram.Jpg";
import yoonJoosunImage from "../assets/images/yoon-joosun.Jpg";

export default function AboutPage() {
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
            스튜디오 우당탕탕은 지역의 빈 공간을 발견하고, 사람들과 함께 고치고
            운영하는 공간 프로젝트를 만듭니다.
          </p>
        </div>

        <div className="about-layout">
          <aside className="company-people-side">
            <article className="company-person-card">
              <img
                src={chaAramImage}
                alt="채아람 대표"
                className="person-photo"
              />
              <div>
                <span>채아람</span>
                <h3>쓰고 그리고 중재하는 기획자</h3>
                <p>
                  스튜디오 우당탕탕의 대표로, 장소와 사람 사이의 이야기를
                  발견하고 지역 활성화 프로젝트를 기획합니다.
                </p>
              </div>
            </article>

            <article className="company-person-card">
              <img
                src={yoonJoosunImage}
                alt="윤주선 교수"
                className="person-photo"
              />
              <div>
                <span>윤주선</span>
                <h3>건축의 업역을 확장하는 동네 건축가</h3>
                <p>
                  우당탕탕 Lab.을 기반으로 DIT와 지역재생의 개념을 연구하고,
                  스튜디오 우당탕탕과 함께 프로젝트를 공동기획합니다.
                </p>
              </div>
            </article>
          </aside>

          <section className="company-section">
            <article className="company-hero-card">
              <span className="company-kicker">TEAM UDANGTANGTANG</span>
              <h2>team 우당탕탕은 공간을 함께 짓는 팀입니다.</h2>
              <p>
                studio&amp;lab 우당탕탕은 스튜디오 우당탕탕과 우당탕탕 Lab.이
                함께 만들어가는 협업 단위입니다. 지역의 빈 공간을 발견하고,
                사람들의 이야기와 필요를 바탕으로 공간을 고치고 운영 가능한
                장소로 바꾸는 일을 합니다.
              </p>
            </article>

            <div className="company-card-grid">
              <article className="company-card">
                <span>01</span>
                <h3>지역과 장소를 읽습니다</h3>
                <p>
                  팀 우당탕탕은 건물을 단순히 고치는 것보다, 그 공간에 얽힌
                  사람들의 이야기와 지역의 맥락을 먼저 살핍니다. 오래된 장소가
                  가진 공공성과 가능성을 발견하고, 실제 변화로 이어질 수 있는
                  프로젝트를 기획합니다.
                </p>
              </article>

              <article className="company-card">
                <span>02</span>
                <h3>DIT 방식으로 함께 만듭니다</h3>
                <p>
                  DIT는 Do It Together의 줄임말로, 전문가만 공간을 만드는 것이
                  아니라 운영자, 주민, 참가자, 시공 전문가가 함께 공간을
                  만들어가는 참여형 시공 방식입니다.
                </p>
              </article>

              <article className="company-card">
                <span>03</span>
                <h3>공간을 관계로 확장합니다</h3>
                <p>
                  직접 만든 공간은 단순한 결과물이 아니라 애착과 관계가 쌓이는
                  장소가 됩니다. 팀 우당탕탕은 공간을 통해 사람들이 다시
                  찾아오고, 서로의 안부를 궁금해하는 연결을 만듭니다.
                </p>
              </article>

              <article className="company-card">
                <span>04</span>
                <h3>짓는 사람의 범위를 넓힙니다</h3>
                <p>
                  팀 우당탕탕은 건축을 도면과 설계에만 가두지 않고, 목공, 기획,
                  운영, 돌봄까지 확장된 행위로 바라봅니다. 누구나 호기심을
                  가지고 공간 만들기에 참여할 수 있다는 태도를 지향합니다.
                </p>
              </article>
            </div>

            <article className="company-quote-card">
              <div>
                <span>OUR ATTITUDE</span>
                <h3>좋은 공간은 완성보다 살림에 가깝습니다.</h3>
              </div>
              <p>
                팀 우당탕탕은 공간을 만드는 일에서 끝나지 않고, 만든 공간을
                보살피고 운영하며 사람들이 계속 찾아오고 싶은 장소로 유지하는
                과정을 중요하게 생각합니다.
              </p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
