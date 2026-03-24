const express = require('express');
const app = express();
app.use(express.json());

app.post('/test', (req, res) => {
  console.log('TEST endpoint hit');
  res.json({ success: true, message: 'Test works' });
});

app.listen(3003, () => {
  console.log('Test server listening on 3003');
});
