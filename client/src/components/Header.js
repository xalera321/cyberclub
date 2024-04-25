import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Header = ({ loggedInUsername }) => {
    const [avatar, setAvatar] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.error('Токен не найден');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/users/name/${loggedInUsername}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUserData(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        if (loggedInUsername) {
            fetchUserData();
        }
    }, [loggedInUsername]);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                if (!userData) return;

                const response = await axios.get(`http://localhost:8080/avatar/${userData.user_id}`);
                setAvatar(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        if (userData) {
            fetchAvatar();
        }
    }, [userData]);

    return (
        <header>
            <nav className="navbar mb-1 navbar-expand-lg shadow bg-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand text-white" to="/">CyberClub</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="navbarText">
                        <ul className="navbar-nav mb-3 mb-lg-0">
                            <li className="nav-item mx-3">
                                <a className="nav-link text-white" href="about_us.html">О нас</a>
                            </li>
                            <li className="nav-item mx-3">
                                <a className="nav-link text-white" href="#">Контакты</a>
                            </li>
                        </ul>
                    </div>
                    <div className="navbar-text text-white">
                        {loggedInUsername && avatar ? (
                            <Link to="/account">
                                <img src={`http://localhost:8080/avatar/${userData.user_id}`} alt="User Avatar" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-warning rounded-pill" data-bs-toggle="modal" data-bs-target="#login">Вход</Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
