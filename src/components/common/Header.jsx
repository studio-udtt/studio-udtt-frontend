import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="shell header-inner">
        <Link to="/" className="logo">
          <span className="pre">studio&amp;lab</span>
          <span className="name">
            우당탕탕<span className="dot">.</span>
          </span>
        </Link>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-btn active" : "nav-btn"
            }
          >
            메인
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
