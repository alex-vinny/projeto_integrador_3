const db = require('./db');

const gardenStatus = [
    {status: 1, description: 'feliz'},
    {status: 2, description: 'triste'},
    {status: 3, description: 'enxarcado'},
]

module.exports.current = function(getValue) {    
    if (getValue) {
        db.gardenCurrent(getValue);
    }
};

module.exports.insert = function(data, getValue) {
    if (getValue) {
        let invalid = false;
        let msg = '';

        if (!data) {
            invalid = true;
            msg = "Corpo da requisição não pode ser vazio";
        } else {

            const payload = JSON.stringify(data);
            const garden = JSON.parse(payload);

            if (!garden.status) {
                invalid = true;
                msg = "Incluir os campos [status] e/ou [description] na requisição";
            } else {
                console.log('Options', gardenStatus);
                console.log('Request', garden);
                const items = gardenStatus.filter(el => el.status === garden.status);

                if (items.length == 0) {
                    invalid = true;
                    msg = `Campo [status] com valor diferente do intervalo permitido: ${JSON.stringify(gardenStatus)}`;
                } else {
                    db.gardenInsert(payload, items[0], getValue);
                }
            }
        }

        if (invalid) {
            getValue(undefined, msg);
        }
    }
};