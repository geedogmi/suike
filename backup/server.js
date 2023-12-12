import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// __dirname 설정 (ESM 모듈을 사용하는 경우)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname)));

// 루트 URL 요청 시 index.html 제공
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});