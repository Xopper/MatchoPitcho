const router = require("express").Router()
const pool = require('../model/dbConnection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const isEmpty = (obj) =>{
    for (let prop in obj)
    {
        if (obj.hasOwnProperty(prop))
            return false
    }
    return true
}

function userNameFound(userName){
    return new Promise((res, rej) => {
        pool.getConnection((err, connection) => {
            if (err)
                rej(err)
            else{
                connection.execute('SELECT COUNT(*) as count FROM `users` WHERE `user_name` = ?', [userName], (err, result)=>{
                    if (err)
                        rej(err)
                    else{
                        const queryResult = result[0].count
                        connection.release()
                        res(queryResult)
                    }
                })
            }
        })
    })
}

function getUserPassword(userName)
{
    return new Promise((res, rej) =>{
        pool.getConnection((err, connection) =>{
            if (err) rej(err)
            connection.execute('SELECT `password` FROM `users` WHERE `user_name` = ?', [userName], (err, result) =>{
                if (err) 
                    rej(err)
                else{
                    const queryResult = result[0].password
                    connection.release()
                    res(queryResult)
                }
            })
        })
    })
}

function checkIfVerifiedAccount(userName)
{
    return new Promise((res, rej) =>{
        pool.getConnection((err, connection) =>{
            if (err) rej(err)
            connection.execute('SELECT `verified` FROM `users` WHERE `user_name` = ?', [userName], (err, result) =>{
                if (err) 
                    rej(err)
                else
                {
                    const queryResult = result[0].verified
                    connection.release()
                    res(queryResult)
                }  
            })
        })
    })
}

function getUserAuthenticationToken(userName)
{
    return new Promise((res, rej) =>{
        pool.getConnection((err, connection) =>{
            if (err) rej(err)
            connection.execute('SELECT `authentication_token` FROM `users` WHERE `user_name` = ?', [userName], (err, result) =>{
                if (err) 
                    rej(err)
                else
                {
                    const queryResult = result[0].authentication_token
                    connection.release()
                    res(queryResult)
                }  
            })
        })
    })
}

const checkLoginInputs = (values) =>{
    let errors = {};

	// validating username
	if (!values.username || values.username.trim() === "") {
		errors.username = "Username is required field.";
	} else if (!/^\w+$/.test(values.username)) {
		errors.username = "Use only Alpha numeric characters.";
	} else if (values.username.length < 3) {
		errors.username = "Username must be at least 4 characters.";
	} else if (values.username.length > 12) {
		errors.username = "Username must be less than 13 characters.";
	}
	// ba9a unique f database [men l backEnd]

	// TODO {insert valid reg expression} [Done]
	// validate Password
	if (!values.password) {
		errors.password = "Password is required field.";
	} else if (!/(?=.{8,32})(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?=.*[a-z])(?=.*\d).*$/.test(values.password)) {
		errors.password = "Use [lower-Upper] case, special chars and numbers.";
	} else if (values.password.length <= 8) {
		errors.password = "Password must be at least 8 characters.";
	} else if (values.password.length > 32) {
		errors.password = "Password must be less than 32 characters.";
	}
	return errors;
}

const validateLoginData = async (req, res, next) =>{
    const loginInputData = req.body.values
    loginInputData.username = loginInputData.username.trim()

    const loginErrors = {}
    const userNameExists = await userNameFound(loginInputData.username)
    const checkerResult = checkLoginInputs(loginInputData)
    if (!isEmpty(checkerResult))
    {
        req.loginErrors = checkerResult
        next()
    }else{
        if (userNameExists === 0)
        {
            loginErrors.userNameOrPasswordError = "User Name or Password is wrong"
            req.loginErrors = loginErrors
            next()
        } else if (userNameExists === 1){
            const userpassword = await getUserPassword(loginInputData.username)
            const validPassword = await bcrypt.compare(loginInputData.password, userpassword)
            if (!validPassword)
            {
                loginErrors.userNameOrPasswordError = "User Name or Password is wrong"
                req.loginErrors = loginErrors
                next()
            } else if(validPassword)
            {
                const verifiedAccount = await checkIfVerifiedAccount(loginInputData.username)
                if (verifiedAccount === 0)
                {
                    loginErrors.userNameOrPasswordError = "Verify your account via the link sent to your registration email"
                    req.loginErrors = loginErrors
                    next()
                } else if (verifiedAccount === 1){
                    // get the auth token from the database
                    const authenticationToken = await getUserAuthenticationToken(loginInputData.username)
                    req.authenticationToken = authenticationToken
                    next()
                }
            }
        }
    }

}

router.post("/validate/login", validateLoginData,(req, res) => {

    const msgFromBackEnd = {}

    if (!isEmpty(req.loginErrors))
    {
        console.log(req.loginErrors)
        msgFromBackEnd.errors = req.loginErrors
        msgFromBackEnd.status = 1
        res.send(msgFromBackEnd)
    }
    else
    {
        msgFromBackEnd.authToken = req.authenticationToken
        msgFromBackEnd.status = 0
        res.send(msgFromBackEnd)
    }
})


module.exports = router