/**
 * Navbar.jsx
 * ==========
 * Top navigation bar component with Lucide icons.
 */

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Landmark, Home, BarChart3, UserCircle } from 'lucide-react';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-mark"><Landmark size={18} /></span>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-5 brand-title">LoanRisk AI</span>
            <small className="brand-subtitle">Decision workspace</small>
          </div>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link d-inline-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
                end
              >
                <Home size={16} />
                <span>Home</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/predict" 
                className={({ isActive }) => `nav-link d-inline-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
              >
                <BarChart3 size={16} />
                <span>Predict Default Risk</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/about" 
                className={({ isActive }) => `nav-link d-inline-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
              >
                <UserCircle size={16} />
                <span>About</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
