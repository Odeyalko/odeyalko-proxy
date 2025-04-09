const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Разрешаем CORS для всех запросов
app.use(cors());

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('No URL provided');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Referer': 'https://www.lamoda.ru/'
      }
    });

    // Если ответ не OK, возвращаем ошибку с кодом статуса
    if (!response.ok) {
      return res.status(response.status).send(`Error: ${response.statusText}`);
    }

    // Если API возвращает JSON, например, AllOrigins-style API,
    // проверяем наличие поля "contents"
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') > -1) {
      const json = await response.json();
      if (json && json.contents) {
        res.send(json.contents);
      } else {
        res.json(json);
      }
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    res.status(500).send(`Server error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
