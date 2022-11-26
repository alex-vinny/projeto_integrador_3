const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');
const model = require('./garden');
const config = require('./config');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(auth.validateToken);

app.get('/', (req, res) => {
  const img = "https://cdn.glitch.global/5ee021c2-ff34-4c4f-b0d1-1eb1f0351307/apk.png?v=1669416199172";
  const content = `<!DOCTYPE html>\
<html>\
  <head>\
  <style>\
    body { background-color: #e6fffa;}\
    h3 {text-align: center;}\
    p {text-align: center;}\
    div {text-align: center;}\
  </style>\
  </head>\
  <h3>Scaneie o App Smart Garden aqui!</h3>\
  <p><img src='${img}' width='300' height='300' alt='Link do APP' /></p>\
  <div><b>Smart Garden API OK!</b></div>\
<body>`
  res.send(content);
});

app.get('/download', function(req, res) {
  const file_url = `https://cdn.glitch.global/5ee021c2-ff34-4c4f-b0d1-1eb1f0351307/app.apk?v=1669456061628`;
  res.redirect(file_url);
});

app.get('/api/token/:id', function(req, res) {
    const id = req.params.id;
    console.log("app_id: ", id);
    
    auth.generateToken(id, function(result) {
        if (!result) {
            const msg = "AppId inválido para gerar novo token!";
            return res.status(500).send({msg});
        }

        const token = result.token;
        console.log("new token", token);
        return res.json({token});
    });
});

app.get('/api/garden', function(req, res) {
    model.current(function(data) {
        if (!data) {
            const msg = "Não foi localizado status atual.";
            return res.status(503).send({msg});
        }
        return res.json(data);
    });
});

app.get('/api/sendgarden', function(req, res) {
  const data = {status: Number(req.query.status) };
  
  if (!data.status) {
        const msg = "Não foi localizado status para atualizar.";
        return res.status(502).send({msg});
  }
  
  model.insert(data, function(status, details) {
    if (!status) {
      const msg = `Não foi possível incluir o status: ${JSON.stringify(data)}. Motivo: ${details}`;
      return res.status(500).send({msg});
    }
    
    const msg = 'Status da irrigação foi adicionado corretamente.';
    return res.send({msg, data: status});
  });
});

app.post('/api/garden', function (req, res) {
    if (!req.body) {
        const msg = "Não foi localizado status atual.";
        return res.status(502).send({msg});
    }

    model.insert(req.body, function(status, details) {
        if (!status) {
            const msg = `Não foi possível incluir o status: ${JSON.stringify(req.body)}. Motivo: ${details}`;
            return res.status(500).send({msg});
        }

        const msg = 'Status da irrigação foi adicionado corretamente.';
        return res.send({msg, data: status});
    });
});

app.use((req, res)=> {
    const msg = '404 - Página não encontrada';
    res.status(400).send({msg});
});

// Run the server and report out to the logs
app.listen(config.AppPort, config.AppIp , function (err) {
    if (err) {
      console.log.error(err);
      process.exit(1);
    }
    console.log(`Smart Garden API is listening on ${config.AppIp}:${config.AppPort}`);
    console.log(`server listening on ${config.AppIp}:${config.AppPort}`);
});
