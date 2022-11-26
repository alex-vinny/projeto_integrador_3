const db = require('./db');
const config = require('./config');

const validate = function (req, res, next) {
    if (req.path == '/api/garden') {        
        db.validToken(function(token) {
            let error = true;
            
            const headers = JSON.parse(JSON.stringify(req.headers));
        
            if (headers && headers.authorization) {

                const tokenArray = headers.authorization.split(" ");
                console.log("token", tokenArray, token);

                if (tokenArray || tokenArray.length > 1) {

                    if (tokenArray[0] == 'Bearer' 
                        && tokenArray[1] == token) {
                        error = false;
                    }
                }
            }

            if (error) {
                const msg = "Token inválido!";
                return res.status(401).send({msg});
            } else {
                next();
            }
        });
    } else {
        // Outras rotas
        next();
    }
};

const validateFromUri = function (req, res, next) {
    if (req.path == '/api/garden') {        
    
      const secret = config.SecretKey;
      const headers = JSON.parse(JSON.stringify(req.headers));
      const token = req.query.token;
      
      console.log("token-validade", secret, token);

      if (secret !== token) {
          const msg = "Token inválido!";
          return res.status(401).send({msg});
      } else {
          next();
      }    
    } else {
        // Outras rotas
        next();
    }
};

module.exports.generateToken = function(reqAppId, func) {
    db.getAppId(function(appId) {        
        if (appId == reqAppId) {
            db.generateToken(function(value) {
                var obj = undefined;

                if (value && value.length > 0) {
                    obj = value[0];
                }

                func(obj);                
            });
        } else {
            func();
        }
    });
};

module.exports.validateToken = validateFromUri;