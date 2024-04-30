import React, { useEffect, useState } from 'react';
import ComputerList from './Admin/computers';
import UserTable from './Admin/userTable';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import SessionTable from './Admin/sessionTable';
import ComputerTable from './Admin/Manager/ComputerTable';
import Cookies from 'js-cookie';
import ManagerPanel from './Admin/managerpanel';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Alert } from '@mui/material';


function AdminPanel({ handleLogout, setLoggedInUsernameAdmin }) {
    const [adminRole, setAdminRole] = useState(null);
    const fetchAdminRole = async () => {
        var username = Cookies.get('username');
        console.log(username)
        const response = await axios.get(`http://localhost:8080/employee/${username}`)
        setAdminRole(response.data)
        console.log(adminRole)
    }

    const handleLogoutAndRedirect = () => {
        handleLogout();
        return <Navigate to="/" replace />; // Перенаправление на главную страницу
    };

    useEffect(() => {
        fetchAdminRole();
    }, []);
    if (adminRole === "Менеджер"){
    return (
        
        <div className="container card mb-3 mt-3"> 
        <ManagerPanel></ManagerPanel>   
            <div>
            <div className="container">
            <ComputerList></ComputerList>
            <ToastContainer></ToastContainer>
            <ComputerTable></ComputerTable>

            <button className="btn btn-danger mb-2" onClick={handleLogout}>Выход из аккаунта</button>
                </div>
            </div>
        </div>
    );
}
if (adminRole === "Администратор"){
    return (
        
        <div className="container card mb-3 mt-3"> 
            <div>
            <div className="container">
            <h2 className='mt-2'>Панель администратора</h2>
            <UserTable></UserTable>
            <SessionTable></SessionTable>
            <ComputerList></ComputerList>
            <ToastContainer></ToastContainer>

            <button className="btn btn-danger mb-2" onClick={handleLogoutAndRedirect}>Выход из аккаунта</button>
                </div>
            </div>
        </div>
    );
}
}
export default AdminPanel;
