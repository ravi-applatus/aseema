
const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

module.exports = {

    generateJWTToken: async function(user = null) {
        // Validate User Here
        // Then generate JWT Token
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            user: user,
            time: Date(),
        }
    
        const token = jwt.sign(data, jwtSecretKey);
        return token;
    },
}