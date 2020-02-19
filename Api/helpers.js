let convert = {};
const Cookies = require('cookies');


convert.makeid = function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

convert.setState = function (user, state) {
    let stateKeys = Object.keys(state);
    for (const stateKey of stateKeys) {
        user[stateKey] = state[stateKey];
    }
};



convert.updateCookies = function updateCookies(req, res) {
    let cookies = new Cookies(req, res);
    let token = cookies.get('token');
    if (!token) {
        let newId = convert.makeid(20);
        res.cookie('token', newId).send({
            status: 'success'
        })
    } else {
        res.json('succes'); //We moeten een reply geven.
    }
};


module.exports = convert;
