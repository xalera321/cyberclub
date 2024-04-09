const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: '465',
    secure: true,
    auth: {
        user: 'test_laba8dob@mail.ru',
        pass: 'fU0Rz9c9hw9UPQaZqWPc',
    }
}, {
    from: 'CyberClub <test_laba8dob@mail.ru>'
});

const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: '5432',
        user: 'xalera',
        password: '123123123',
        database: 'cyberclub',
    },
});

const app = express();
app.use(bodyParser.json());

const uploadDirectory = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        const uniqueFilename = `${userId}_avatar${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ storage: storage });

const PORT = 8080;
const JWT_SECRET = 'secretkeyforcyberclub';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }
        req.user = user;
        console.log(token)
        next();
    });
}

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Обработка запросов к файлам в папке uploads
app.use('/uploads', express.static('uploads'));

const defaultAvatarPath = 'uploads/default_avatar.png';

app.post('/register', async (req, res) => {
    const { login, email, u_password } = req.body;

    try {
        const existingUser = await db('userprofile').where('login', login).orWhere('email', email).first();
        if (existingUser) {
            if (existingUser.login === login) {
                return res.status(400).json({ error: 'User with this login already exists' });
            } else {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
        }

        const token = jwt.sign({ login, email }, 'cyberclubregistration', { expiresIn: '1h' });

        const defaultAvatarPath = 'uploads/default_avatar.png'; // Путь к аватарке по умолчанию

        transporter.sendMail({
            to: email,
            subject: 'Подтверждение регистрации',
            text: 'Подтверждение регистрации',
            html: `<h1>Подтвердите регистрацию!</h1>
        <p>Уважаемый ${login}, благодарим вас за регистрацию на сайте компьютерного клуба CyberClub  
        <p>Для подтверждения вашей учетной записи перейдите по <a href="http://localhost:8080/confirm/${token}">ссылке</a>.</p>
        <p>Обращаем ваше внимание, что это письмо отправлено автоматически и отвечать на него не нужно</p>
          `
        }).then(async () => {
            console.info("Письмо успешно отправлено на адрес: ", email);
            const newUser = await db('userprofile').insert({
                login,
                email,
                u_password,
                confirmed: false,
                bonus_points: 0,
                avatar_path: defaultAvatarPath // Устанавливаем путь к аватарке по умолчанию
            }).returning('*');

            res.status(201).json(newUser[0]);
        }).catch(err => {
            console.warn("Произошла ошибка при отправке сообщения:", err);
            res.status(500).send('Error sending email');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/confirm/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const verifyToken = jwt.verify(token, 'cyberclubregistration')
        const { login, email } = verifyToken;
        console.log(login, email)
        const user = await db('userprofile').where({ login }).andWhere({ email }).first();
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        await db('userprofile').where({ login, email }).update({ confirmed: true });
        res.status(200).json({ message: 'Account confirmed successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});

app.post('/login', async (req, res) => {
    const { login, u_password } = req.body;
    try {
        const user = await db('userprofile').where({ login, u_password }).first();
        if (!user) {
            return res.status(401).json({ error: 'Invalid login or password' });
        }
        if (!user.confirmed) {
            return res.status(401).json({ error: "Account is not confirmed" });
        }
        const accessToken = jwt.sign({ id: user.user_id }, JWT_SECRET);
        res.json({ accessToken, username: user.login }); // Добавляем имя пользователя в ответ
        console.log(`User ${user.login} has logged in`); // Выводим имя пользователя в консоль
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/admin/login', async (req, res) => {
    const { login, e_password } = req.body;

    try {
        const employee = await db('employee').where({ login, e_password }).first();
        if (!employee) {
            return res.status(401).json({ error: 'Invalid login or password' });
        }

        const accessToken = jwt.sign({ employee_id: employee.employee_id, role: employee.role_name, username: employee.login }, JWT_SECRET);
        const username = employee.login
        res.json({ accessToken, username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/users/:id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    console.log('userId:', userId);
    console.log('req.user.id:', req.user.id);

    if (req.user.role !== 'Администратор' && userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const userProfile = await db('userprofile').where('user_id', userId).select('*').first();
        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/users/name/:name', authenticateToken, async (req, res) => {
    const name = req.params.name;
    console.log(name);
    try {
        const userProfile = await db('userprofile').where('login', name).select('*').first();
        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/users/:id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { login, u_password, email, account_image, balance } = req.body;
    try {
        if (req.user.role !== 'Администратор' && userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const updatedUserData = {
            login,
            u_password,
            email,
        };

        const updatedUser = await db('userprofile')
            .where('user_id', userId)
            .update(updatedUserData)
            .returning('*');
        res.json(updatedUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/users/:id/image', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { account_image } = req.body;
    try {
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedUser = await db('userprofile')
            .where('user_id', userId)
            .update({ account_image })
            .returning('*');
        res.json(updatedUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/sessions/:id', authenticateToken, async (req, res) => {
    const user_id = parseInt(req.params.id);
    const { duration, computer_id } = req.body;

    try {
        if (duration <= 0) {
            return res.status(403).json({ error: 'Duration must be greater than 0' });
        }

        if (req.user.role !== 'Администратор' && user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const user = await db('userprofile').where('user_id', user_id).select('balance', 'bonus_points').first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const computer = await db('computer').where('computer_id', computer_id).select('session_id').first();
        if (!computer) {
            return res.status(404).json({ error: 'Computer not found' });
        }

        if (computer.session_id) {
            return res.status(400).json({ error: 'Computer already in use' });
        }

        const tariff = 0.5;
        const cost = duration * tariff;
        const bonusPoints = Math.floor(cost * 0.05); // Рассчитываем бонусные баллы

        const updatedBalance = user.balance - cost;
        const updatedBonusPoints = user.bonus_points + bonusPoints;

        await db('userprofile').where('user_id', user_id).update({
            balance: updatedBalance,
            bonus_points: updatedBonusPoints
        });

        const date_time_start = new Date();
        const date_time_end = new Date(date_time_start.getTime() + duration * 60000);

        const newSession = await db('session').insert({
            date_time_start,
            date_time_end,
            duration,
            user_id,
        }).returning('*');
        const session_id = newSession[0].session_id;
        console.log(session_id);
        await db('computer').where('computer_id', computer_id).update('session_id', session_id);
        res.json(newSession[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


async function endSessions() {
    try {
        const currentTime = new Date();
        const endingSessions = await db('session').where('date_time_end', '<=', currentTime);
        for (const session of endingSessions) {
            await db('session').where('session_id', session.session_id).del();
        }
        console.log(`Ended ${endingSessions.length} sessions.`);
    } catch (error) {
        console.error('Error ending sessions:', error);
    }
}

function executeTask() {
    endSessions()
        .then(() => {
            setTimeout(executeTask, 30000);
        })
        .catch(error => {
            console.error('Error executing task:', error);
            setTimeout(executeTask, 30000);
        });
}
executeTask();

app.put('/sessions/end/:id', authenticateToken, async (req, res) => {
    const sessionId = req.params.id;

    try {
        const session = await db('session').where('session_id', sessionId).first();
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (req.user.role !== 'Администратор' && session.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const remainingMinutes = Math.ceil((session.date_time_end.getTime() - Date.now()) / (1000 * 60));
        if (remainingMinutes <= 0) {
            return res.status(400).json({ error: 'Session has already ended' });
        }

        const balanceToAdd = remainingMinutes * 0.5;
        const updatedBalance = await db('userprofile')
            .where('user_id', session.user_id)
            .increment('balance', balanceToAdd)
            .returning('balance');

        await db('session').where('session_id', sessionId).del();
        await db('computer').where('session_id', sessionId).update({ 'avatar_path': avatarPath })


        return res.json({ message: 'Session ended successfully', balance: updatedBalance[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/computers', authenticateToken, async (req, res) => {

    const { employee_id } = req.body;
    if (req.user.role !== 'Администратор' && req.user.role !== 'Менеджер') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        const newComputer = await db('computer').insert({
            employee_id,
        }).returning('*');

        res.json(newComputer[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/computers', async (req, res) => {
    try {
        const computers = await db('computer').select('*');
        res.json(computers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/userprofiles', async (req, res) => {
    try {
        const userProfiles = await db('userprofile').select('*');
        res.json(userProfiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/payments', async (req, res) => {
    try {
        const payments = await db('payment').select('*');
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/sessions', async (req, res) => {
    try {
        const sessions = await db('session').select('*');
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/avatar/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const userProfile = await db('userprofile').where('user_id', userId).select('avatar_path').first();
        if (!userProfile || !userProfile.avatar_path) {
            return res.status(404).json({ error: 'User or avatar not found' });
        }
        const avatarPath = path.join(__dirname, userProfile.avatar_path);
        res.sendFile(avatarPath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user.id;
        const avatarPath = path.normalize(req.file.path);

        const updatedUser = await db('userprofile')
            .where('user_id', userId)
            .update({ 'avatar_path': avatarPath });

        res.json({ message: 'Avatar uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/users/:id/recharge', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { amount } = req.body;

    try {
        if (req.user.role !== 'Администратор') {
            return res.status(403).json({ error: 'Forbidden: Only administrators can recharge balance' });
        }
        const userProfile = await db('userprofile')
            .where('user_id', userId)
            .increment('balance', amount)
            .returning('*');

        if (!userProfile || userProfile.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(userProfile[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await db('userprofile').where('user_id', userId).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/users/:id/login', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { newLogin } = req.body; // Предполагается, что новый логин передается в теле запроса как newLogin

    try {
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Проверяем, существует ли пользователь с заданным новым логином
        const existingUser = await db('userprofile').where('login', newLogin).first();
        if (existingUser) {
            return res.status(400).json({ error: 'User with this login already exists' });
        }

        // Обновляем логин пользователя в базе данных
        const updatedUser = await db('userprofile')
            .where('user_id', userId)
            .update({ login: newLogin })
            .returning('*');

        res.json(updatedUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Добавляем новый маршрут и обработчик для изменения пароля
app.put('/users/:userId/password', async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Проверка соответствия нового пароля и его подтверждения
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    try {
        // Проверка соответствия старого пароля
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.u_password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid old password' });
        }

        // Обновление пароля пользователя
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.u_password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(8080, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});