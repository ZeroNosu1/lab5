'use strict';

const express = require('express');
const crypto = require('crypto');
const wrRoute = express.Router();
const connection = require('../db');

// Insert new user
wrRoute.post('/users', function (req, res, next) {
    let mypass = crypto.createHash('md5').update(req.body.password).digest("hex");

    connection.execute(`INSERT INTO Users_tbl (name, tel, username, email, password) VALUES (?, ?, ?, ?, ?);`,
        [req.body.name, req.body.tel, req.body.username, req.body.email, mypass])
        .then(() => {
            console.log('ok');
            res.status(201).send('User created successfully');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error creating user');
        });
});

// Get all users
wrRoute.get('/users', function (req, res, next) {
    connection.execute('SELECT * FROM Users_tbl;')
        .then((result) => {
            var rawData = result[0];
            res.send(JSON.stringify(rawData));
        }).catch((err) => {
            console.error('Error fetching users:', err);
            res.status(500).send("Error fetching users.");
        });
});

// Check user credentials
wrRoute.post('/check', function (req, res, next) {
    let mypass = crypto.createHash('md5').update(req.body.password).digest("hex");
    
    connection.execute('SELECT * FROM Users_tbl WHERE username=? AND password=?;',
    [req.body.username, mypass]).then((result) => {
        var data = result[0];
        if (data.length === 0) {
           res.sendStatus(400); // No matching user found
        } else {
           res.sendStatus(200); // Matching user found
        }
     }).catch((err) => {
        console.error('Error checking user:', err);
        res.status(500).send("Error checking user.");
     });
 });

// Handle 404 for undefined routes
wrRoute.use('/', function (req, res, next) {
    res.sendStatus(404);
});

module.exports = wrRoute;