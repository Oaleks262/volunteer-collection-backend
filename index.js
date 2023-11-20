
import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import {registerValidator} from "./validation/auth.js";
import {validationResult} from "express-validator";
import {loginValidator} from "./validation/auth.js";
import UserModel from "./models/User.js";
import BankModel from "./models/Bank.js";
import TitleModel from "./models/Title.js";
import AboutModel from "./models/About.js";
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();

const dbConnectionString = process.env.DB_CONNECTION_STRING;
const secretKey = process.env.SECRET_KEY;


const PORT = process.env.PORT || 4444


mongoose.connect(dbConnectionString)
.then(()=>{console.log('DB ok')})
.catch((err)=> {console.log('DB error', err)});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/auth/login', loginValidator, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({ message: "Користувача не знайдено" });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: "Неправильний пароль" });
        }

        const token = jwt.sign({ _id: user._id }, secretKey, { expiresIn: '30d' });

        const { passwordHash, ...userData } = user._doc;

        res.json({ ...userData, token });
    } catch (err) {
        res.status(500).json({ message: "Помилка під час аутентифікації" });
    }
});

app.post('/admin/logout', (req, res) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'Токен відсутній. Доступ заборонено.' });
        }
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Невірний токен. Доступ заборонено.' });
            }
            res.json({ message: 'Адмін вийшов з системи успішно' });
        });
    } catch (error) {
        console.error('Помилка під час виходу', error);
        res.status(500).json({ message: 'Помилка під час виходу' });
    }
});
app.post('/auth/register' , registerValidator, async (req, res)=>{
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);


    const doc = new UserModel({
        email: req.body.email,
        passwordHash: hash,
    })

    const user = await doc.save();
    const token =jwt.sign({
        _id: user._id
    }, secretKey,{
        expiresIn: '30d'
    })
    const {passwordHash, ...userData} = user._doc
    res.json({ ...userData, token,});
} catch(err){
    res.status(500).json({
        message: "Не зареєструвався"
    })
}
})
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Немає токену. Доступ заборонено." });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Невірний токен. Доступ заборонено." });
        }

        req.user = user;
        next();
    });
};
app.get('/bank', async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const bankInfo = await BankModel.findOne();

        if (!bankInfo) {
            return res.status(404).json({ message: "Інформація про банк не знайдена" });
        }

        res.json(bankInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про банк" });
    }
});

app.get('/admin/bank', authenticateToken, async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const bankInfo = await BankModel.findOne();

        if (!bankInfo) {
            return res.status(404).json({ message: "Інформація про банк не знайдена" });
        }

        res.json(bankInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про банк" });
    }
});
app.put('/admin/bank', authenticateToken, async (req, res) => {
    try {
        const bankName = req.body.bank;
        
        // Шукаємо існуючий банк за ім'ям
        const existingBank = await BankModel.findOne({ bank: bankName });

        if (existingBank) {
            // Якщо банк існує, видаляємо його
            await BankModel.findByIdAndRemove(existingBank._id);
        }

        // Створюємо новий запис
        const newBank = new BankModel({ bank: bankName });
        await newBank.save();

        res.json({ message: "Інформація про банк додана або оновлена", bank: newBank });
    } catch (error) {
        res.status(500).json({ message: "Помилка при додаванні/оновленні інформації про банк" });
    }
});
// 
app.get('/title', async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const titleInfo = await TitleModel.findOne();

        if (!titleInfo) {
            return res.status(404).json({ message: "Інформація про заголовок не знайдена" });
        }

        res.json(titleInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про заголовок" });
    }
});
app.get('/admin/title', authenticateToken, async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const titleInfo = await TitleModel.findOne();

        if (!titleInfo) {
            return res.status(404).json({ message: "Інформація про заголовок не знайдена" });
        }

        res.json(titleInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про заголовок" });
    }
});
app.put('/admin/title', authenticateToken, async (req, res) => {
    try {
        const titleName = req.body.title;

        // Шукаємо існуючий банк за ім'ям
        const existingTitle = await TitleModel.findOne({ title: titleName });

        if (existingTitle) {
            // Якщо банк існує, видаляємо його
            await TitleModel.findByIdAndRemove(existingTitle._id);
        }

        // Створюємо новий запис
        const newTitle = new TitleModel({ title: titleName });
        await newTitle.save();

        res.json({ message: "Інформація про заголовок додана або оновлена" });
    } catch (error) {
        res.status(500).json({ message: "Помилка при додаванні/оновленні інформації про заголовок" });
    }
});

// 
app.get('/about', async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const aboutInfo = await AboutModel.findOne();

        if (!aboutInfo) {
            return res.status(404).json({ message: "Інформація про опис не знайдена" });
        }

        res.json(aboutInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про опис" });
    }
    });
app.get('/admin/about', authenticateToken, async (req, res) => {
    try {
        // Отримайте інформацію про банк з бази даних
        const aboutInfo = await AboutModel.findOne();

        if (!aboutInfo) {
            return res.status(404).json({ message: "Інформація про опис не знайдена" });
        }

        res.json(aboutInfo);
    } catch (error) {
        res.status(500).json({ message: "Помилка при отриманні інформації про опис" });
    }
});
app.put('/admin/about', authenticateToken, async (req, res) => {
    try {
        const aboutName = req.body.about;
        
        // Шукаємо існуючий опис за ім'ям
        const existingAbout = await AboutModel.findOne({ about: aboutName });

        if (existingAbout) {
            // Якщо опис існує, видаляємо його
            await AboutModel.findByIdAndRemove(existingAbout._id);
        }

        // Створюємо новий запис
        const newAbout = new AboutModel({ about: aboutName });
        await newAbout.save();

        res.json({ message: "Інформація про опис додана або оновлена", about: newAbout });
    } catch (error) {
        res.status(500).json({ message: "Помилка при додаванні/оновленні інформації про опис" });
    }
});

// Додайте ендпоінт видалення
app.delete('/admin/about/:id', authenticateToken, async (req, res) => {
    try {
        const aboutId = req.params.id;

        // Знаходимо і видаляємо запис за ідентифікатором
        const deletedAbout = await AboutModel.findByIdAndDelete(aboutId);

        if (deletedAbout) {
            res.json({ message: "Інформація про опис видалена", about: deletedAbout });
        } else {
            res.status(404).json({ message: "Інформацію про опис не знайдено" });
        }
    } catch (error) {
        res.status(500).json({ message: "Помилка при видаленні інформації про опис" });
    }
});
// Додайте ендпоінт видалення для bank
app.delete('/admin/bank/:id', authenticateToken, async (req, res) => {
    try {
        const bankId = req.params.id;
        const deletedBank = await BankModel.findByIdAndDelete(bankId);

        if (!deletedBank) {
            return res.status(404).json({ message: "Банк не знайдено" });
        }

        res.json({ message: "Інформація про банк видалена", bank: deletedBank });
    } catch (error) {
        res.status(500).json({ message: "Помилка при видаленні інформації про банк" });
    }
});

// Додайте ендпоінт видалення для title
app.delete('/admin/title/:id', authenticateToken, async (req, res) => {
    try {
        const titleId = req.params.id;
        const deletedTitle = await TitleModel.findByIdAndDelete(titleId);

        if (!deletedTitle) {
            return res.status(404).json({ message: "Заголовок не знайдено" });
        }

        res.json({ message: "Інформація про заголовок видалена", title: deletedTitle });
    } catch (error) {
        res.status(500).json({ message: "Помилка при видаленні інформації про заголовок" });
    }
});





app.listen(PORT, (err) => {
    if (err) {
        return console.log(err);
    } else {
        console.log('Server OK');
    }
});