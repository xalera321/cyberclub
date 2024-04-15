import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ loggedInUsername, handleLogout }) => {
    return (
        <header>
            <nav className="navbar mb-1 navbar-expand-lg shadow bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand text-white" href="#">CyberClub</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link text-white" href="about_us.html">О нас</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white" href="#">Контакты</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white" href="shop.html">Витрина</a>
                            </li>
                        </ul>
                        <span className="navbar-text text-white">
                            {loggedInUsername ? (
                                <>
                                    <button className="btn btn-warning rounded-pill" onClick={handleLogout}>Logout</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-warning rounded-pill" data-bs-toggle="modal" data-bs-target="#login">Login</button>
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
