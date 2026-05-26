import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="shell header-inner">
        <Link to="/" className="logo">
          <span className="name">스튜디오 우당탕탕</span>
        </Link>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-btn active" : "nav-btn"
            }
          >
            홈
          </NavLink>

          <NavLink
            to="/recruit"
            className={({ isActive }) =>
              isActive ? "nav-btn active" : "nav-btn"
            }
          >
            의뢰 / 참여모집
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-btn active" : "nav-btn"
            }
          >
            회사 소개
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
