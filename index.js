const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();

if (!fs.existsSync('./store')) {
  fs.mkdir('./store');
}

const zip = multer({dest:'./uploads/'});

app.post('/upload/:commit/:build', zip.any(), (req, res, next) => {
  if (req.body.key !== (process.env.MAC_ARTIFACT_KEY || '')) {
    res.status(403);
    res.json({error: 'Not authorized to upload file'});
    return;
  }
  const zipFile = req.files[0];
  if (zipFile.fieldname !== 'zip' && zipFile.mimetype !== 'application/zip') {
    res.status(400);
    res.json({error: 'Invalid form data'});
    return;
  }
  fs.rename(path.resolve(zipFile.path), path.resolve(`${__dirname}/store/${req.params.commit}_${req.params.build}.zip`));
  res.status(200);
  res.send(`http://${req.get('host')}/download/${req.params.commit}/${req.params.build}`);
});

app.get('/download/:commit/:build', (req, res, next) => {
  const zipPath = path.resolve(`${__dirname}/store/${req.params.commit}_${req.params.build}.zip`);
  console.log(zipPath);
  if (fs.existsSync(zipPath)) {
    res.download(zipPath);
    return;
  }
  res.status(404);
  res.send('File Not Found');
});

app.listen(9001, () => {
  console.log('Listening on :9001');
});
