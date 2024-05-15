import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function ClientCard({ userData }) {
    return (
        <Card variant="outlined" style={{ margin: '20px', padding: '20px', maxWidth: '400px' }}>
            <CardContent>
                <Typography variant="h5" component="h2">
                    Данные клиента
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Имя пользователя: {userData.username}
                </Typography>
                <Typography variant="body2" component="p">
                    Баланс: {userData.balance} руб.
                </Typography>
                <Typography variant="body2" component="p">
                    Бонусные баллы: {userData.bonus_points}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default ClientCard;
