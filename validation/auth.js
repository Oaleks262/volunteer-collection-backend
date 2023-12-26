const { body } = require('express-validator');

exports.registerValidator = [
    body('email').isEmail(),
    body('password').isLength({min: 5})
];
exports.loginValidator = [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
];