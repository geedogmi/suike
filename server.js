import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mariadb from 'mariadb'; // MariaDB 패키지 import

const app = express();
const port = process.env.PORT || 3000;

// MariaDB 연결 풀 설정
const pool = mariadb.createPool({
    host: '13.124.232.208',
    user: 'admin',
    password: 'dhslzkzl2',
    database: 'mydatabase',
    connectionLimit: 5
});

// __dirname 설정 (ESM 모듈을 사용하는 경우)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 'dist' 디렉터리의 정적 파일 제공
app.use('/sub', express.static(path.join(__dirname, '/sub')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

app.post('/submit-score', async (req, res) => {
    try {
        const { score } = req.body;
        const conn = await pool.getConnection();
        await conn.query("INSERT INTO rankings (score) VALUES (?)", [score]);
        conn.end();
        res.json({ message: "Score submitted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.get('/rankings', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT score FROM rankings ORDER BY score DESC LIMIT 5");
        conn.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// 루트 URL 요청 시 루트 디렉터리의 index.html 제공
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});