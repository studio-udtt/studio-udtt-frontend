import { useEffect, useState } from "react";
import { getProjectMap } from "../api/user/projectApi";
import ProjectMap from "../components/project/ProjectMap";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectMap = async () => {
      try {
        const response = await getProjectMap();
        setProjects(response.data);
      } catch (error) {
        console.error("프로젝트 지도 조회 실패:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectMap();
  }, []);

  return (
    <main>
      <div className="shell">
        {isLoading ? (
          <section className="map-loading">
            <p>프로젝트 지도를 불러오는 중입니다.</p>
          </section>
        ) : (
          <ProjectMap projects={projects} />
        )}
      </div>
    </main>
  );
}
