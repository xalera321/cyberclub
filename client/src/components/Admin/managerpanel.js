import React, { useEffect, useState } from 'react';
import EmployeeTable from './Manager/EmployeeTable';
import 'react-toastify/dist/ReactToastify.css';
function ManagerPanel({ username }) {
    return (
        <div>
            <h2>Панель менеджера</h2>
            <EmployeeTable username={username}></EmployeeTable>
        </div>
    );
}

export default ManagerPanel;
