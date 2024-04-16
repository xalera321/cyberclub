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

// db connection
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
        const active = employee.active
        res.json({ accessToken, username, active });
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
    const userId = req.user.id;
    const user = await db('userprofile').where('user_id', userId).first();
    if (user.login !== name){
        return res.status(500).json({ error: 'Forbidden' })
    }
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
    const user = await db('userprofile').where('user_id', userId).first(); // Получаем пользователя по его идентификатору

    try {
        if (req.user.role !== 'Администратор' && userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Проверяем, был ли передан новый логин и не совпадает ли он с текущим
        if (login && login !== user.login) {
            const existingLoginUser = await db('userprofile').whereNot('user_id', userId).andWhere('login', login).first();
            if (existingLoginUser) {
                return res.status(400).json({ error: 'Логин уже используется другим пользователем' });
            }
        }

        // Проверяем, был ли передан новый email и не совпадает ли он с текущим
        if (email && email !== user.email) {
            const existingEmailUser = await db('userprofile').whereNot('user_id', userId).andWhere('email', email).first();
            if (existingEmailUser) {
                return res.status(400).json({ error: 'Email уже используется другим пользователем' });
            }
        }

        // Обновляем только те поля, которые были переданы в запросе
        const updatedUserData = {
            login: login || user.login,
            u_password,
            email: email || user.email,
            account_image,
            balance
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

function gen_password(len) {
    var password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№;%:?*()_+=";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return password;
}

app.post('/employees/', authenticateToken, async (req, res) => {
    const { login, role_name, email } = req.body;
    const employee = await db('employee').where('login', login).first(); // Получаем пользователя по его идентификатору
    const e_password = gen_password(10);
    try {
        if (req.user.role !== 'Менеджер') {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        if (employee) {
            return res.status(400).json({ error: 'Логин уже используется другим пользователем' });
        }

        const newEmployeeData = {
            login: login,
            role_name: role_name,
            e_password: e_password
        };
        try {
            transporter.sendMail({
                to: email,
                subject: 'Новый пароль',
                text: 'Новый пароль',
                html: `<h1>Новый пароль для администратора!</h1>
        <p>Уважаемый ${login}, ваш пароль для входа в админ панель: ${e_password}.</p>
          `
            }).then(async () => {
                const newEmployee = await db('employee')
                    .insert(newEmployeeData)
                    .returning('*');
            })
        }
        catch (error) {
            return res.status(400).json("Не удалось отправить письмо")
        }


        res.json(newEmployeeData[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/employees/:id', authenticateToken, async (req, res) => {
    const employeeId = parseInt(req.params.id);
    console.log('успех')
    const { login, role_name, active } = req.body;
    const employee = await db('employee').where('employee_id', employeeId).first(); // Получаем пользователя по его идентификатору

    try {
        console.log(req.user.role)
        if (req.user.role !== 'Менеджер') {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        // Проверяем, был ли передан новый логин и не совпадает ли он с текущим
        if (login && login !== employee.login) {
            const existingLogin = await db('employee').whereNot('employee_id', employeeId).andWhere('login', login).first();
            if (existingLogin) {
                return res.status(400).json({ error: 'Логин уже используется другим пользователем' });
            }
        }


        // Обновляем только те поля, которые были переданы в запросе
        const updatedEmployeeData = {
            login: login || employee.login,
            role_name: role_name || employee.role_name,
            active: active
        };
        console.log(updatedEmployeeData.active)

        const updatedEmployee = await db('employee')
            .where('employee_id', employeeId)
            .update(updatedEmployeeData)
            .returning('*');

        res.json(updatedEmployee[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/employees', authenticateToken, async (req, res) => {
    // Проверяем роль пользователя
    try {
        // Получаем список сотрудников из базы данных
        const employees = await db('employee').select('*').orderBy('employee_id', 'asc');
        res.json(employees);
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

app.post('/sessions/:id', authenticateToken, async (req, res) => { // старт сессии
    const user_id = parseInt(req.params.id);
    const { duration, computer_id } = req.body;
    otherSession = await db('session').where('user_id', user_id).first();
    try {
        otherSession = await db('session').where('user_id', user_id).first();
        if (otherSession) {
            return res.status(403).json({ error: 'Сессия уже начата' })
        }
        if (duration <= 0) {
            return res.status(403).json({ error: 'Продолжительность сессии должна быть больше 0' });
        }

        if (req.user.role !== 'Администратор' && user_id !== req.user.id) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        const user = await db('userprofile').where('user_id', user_id).select('balance', 'bonus_points').first();
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const computer = await db('computer').where('computer_id', computer_id);
        if (!computer) {
            return res.status(404).json({ error: 'Такого компьютера не существует' });
        }
        console.log(computer)
        if (!computer.active) {
            return res.status(404).json({ error: 'Компьютер в данный момент не доступен!' });
        }

        if (computer.busy) {
            return res.status(400).json({ error: 'Компьютер уже используется' });
        }

        const tariff = 0.5;
        const cost = duration * tariff;
        const bonusPoints = Math.round(Math.floor(cost * 0.05)); // Рассчитываем бонусные баллы
        if (user.balance < cost) {
            return res.status(400).json({ error: 'Недостаточно средств' })
        }
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
            computer_id,
            user_id,
        }).returning('*');

        const computer_update = await db('computer')
            .where('computer_id', computer_id)
            .update({
                busy: true,
            }).returning('*');


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
            const { computer_id } = await db('session').select('computer_id').where('session_id', session.session_id).first();
            await db('session').where('session_id', session.session_id).del();
            const computer_update = await db('computer')
                .where('computer_id', computer_id)
                .update({
                    busy: false,
                }).returning('*');
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

app.put('/sessions/end/:id', authenticateToken, async (req, res) => { // завершить сессию
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

        const { computer_id } = await db('session').select('computer_id').where('session_id', sessionId).first();
        const computer_update = await db('computer')
            .where('computer_id', computer_id)
            .update({
                busy: false,
            }).returning('*');

        await db('session').where('session_id', sessionId).del();


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

app.get('/employees', authenticateToken, async (req, res) => {
    // Проверяем роль пользователя
    if (req.user.role !== 'Менеджер') {
        return res.status(403).json({ error: 'Недостаточно прав' });
    }

    try {
        // Получаем список сотрудников из базы данных
        const employees = await db('employee').select('*');

        // Возвращаем список сотрудников
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/computers/:computerId/toggleActive', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'Менеджер') {
            console.log(req.user.role)
            return res.status(403).json({ error: 'Недостаточно прав' });

        }

        const { computerId } = req.params;

        // Получаем текущее состояние "active" компьютера
        const currentComputer = await db('computer').select('active').where({ computer_id: computerId }).first();
        const isActive = currentComputer.active;
        console.log("победа")
        // Инвертируем состояние "active"
        const updatedActive = !isActive;

        // Обновляем состояние "active" в базе данных
        await db('computer').where({ computer_id: computerId }).update({ active: updatedActive });

        res.json({ message: `Состояние активности компьютера ${computerId} успешно изменено.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/computers/:computerId/changeEmployee', authenticateToken, async (req, res) => {
    console.log(req.params)
    try {
        if (req.user.role !== 'Менеджер') {
            console.log(req.user.role)
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        const { computerId } = req.params;
        const { newEmployee } = req.body
        const currentEmployee = await db('employee').where('login', newEmployee).first()
        console.log(currentEmployee.employee_id)
        console.log(currentEmployee)
        // Инвертируем состояние "active"

        // Обновляем состояние "active" в базе данных
        await db('computer').where({ computer_id: computerId }).update({ "employee_id": currentEmployee.employee_id });

        res.json({ message: `Состояние активности компьютера ${computerId} успешно изменено.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/computers', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Менеджер' && (req.user.role !== "Администратор")) {
        return res.status(403).json({ error: 'Не достаточно' });
    }
    try {
        const computers = await db('computer').select('*').orderBy('computer_id', 'asc');
        for (const computer of computers) {
            const employeeid = computer.employee_id; // Предполагаем, что id администратора хранится в поле admin_id компьютера
            const admin = await db('employee').select('login').where({ 'employee_id': employeeid }).first();
            computer.admin_login = admin.login; // Добавляем логин администратора к объекту компьютера
        }
        res.json(computers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/userprofiles', async (req, res) => {
    try {
        const userProfiles = await db('userprofile').select('*').orderBy('user_id', 'asc');
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
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        if (amount <= 0) {
            return res.status(400).json({ error: "Введена некорректная сумма" })
        }
        const userProfile = await db('userprofile')
            .where('user_id', userId)
            .increment('balance', amount)
            .returning('*');
        const rechange = await db('payment')
            .insert({
                user_id: userId,
                amount: amount,
                date_time: new Date(),
            });


        if (!userProfile || userProfile.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(userProfile[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/employee/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const employee = await db("employee").where("login", username).first();
        res.json(employee.role_name); // Отправляем роль сотрудника в качестве ответа на запрос
    } catch (error) {
        console.error(error); // Выводим ошибку в консоль
        res.status(500).json({ error: "Internal Server Error" }); // Отправляем статус 500 и сообщение об ошибке в случае исключения
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

app.get('/rechanges', authenticateToken, async (req, res) => {
    console.log('scsd')
    try {
        const userId = req.user.id; // Прямое использование req.user.id без parseInt()
        const rechanges = await db('payment').where('user_id', userId);
        res.json(rechanges);
        console.log(rechanges);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
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
    const { newPassword, currentPassword } = req.body;

    try {
        // Проверка соответствия старого пароля
        const user = await db('userprofile').where('user_id', userId).first();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        };

        if (user.u_password !== currentPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        };

        // Обновление пароля пользователя
        newuser = await db('userprofile').where('user_id', userId).update({ u_password: newPassword }).returning('*');

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Добавляем маршрут для отправки письма с подтверждением изменения почты
app.put('/users/:id/email', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { newEmail } = req.body; // Предполагается, что новый email передается в теле запроса как newEmail

    try {
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Проверяем, существует ли пользователь с заданным новым email
        const existingUserWithEmail = await db('userprofile').where('email', newEmail).first();
        if (existingUserWithEmail) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Отправляем письмо с подтверждением на новый email
        const token = jwt.sign({ userId, newEmail }, 'emailChangeToken', { expiresIn: '1h' });
        const confirmationLink = `http://localhost:8080/confirm-email/${token}`;

        transporter.sendMail({
            to: newEmail,
            subject: 'Подтверждение изменения почты',
            text: 'Подтверждение изменения почты',
            html: `
                <h1>Подтвердите изменение почты!</h1>
                <p>Для подтверждения изменения вашего адреса электронной почты перейдите по <a href="${confirmationLink}">ссылке</a>.</p>
            `
        }).then(async () => {
            console.info("Письмо с подтверждением успешно отправлено на адрес: ", newEmail);
            res.status(200).json({ message: 'Confirmation email sent successfully' });
        }).catch(err => {
            console.warn("Произошла ошибка при отправке сообщения:", err);
            res.status(500).send('Error sending confirmation email');
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Добавляем маршрут для обработки подтверждения изменения почты
app.get('/confirm-email/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const { userId, newEmail } = jwt.verify(token, 'emailChangeToken');
        const user = await db('userprofile').where('user_id', userId).first();
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Обновляем адрес электронной почты пользователя
        await db('userprofile').where('user_id', userId).update({ email: newEmail });

        res.status(200).json({ message: 'Email changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});


app.listen(8080, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});