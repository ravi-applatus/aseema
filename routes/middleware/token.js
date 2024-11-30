require('dotenv').config({ path: '.env' });
const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    //const token = req.body.token || req.query.token || req.headers["x-access-token"];
    const token = req.headers["x-access-token"];
    if (!token) {
        return res.status(200).send({success:false, status:403, message:"A token is required for authentication!"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        console.log(err);
        return res.status(401).send("Invalid token");
    }
    next();
};

module.exports = verifyToken;
