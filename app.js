const express = require('express')
const app = express()
app.use(express.json())

const sqlite3 = require('sqlite3')
const path = require('path')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')

let db = null

const dbpath = path.join(__dirname, 'userData.db')

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running on port 3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// Register API

app.post('/register', async (request, response) => {
  let {username, name, password, gender, location} = request.body

  let hashedPassword = await bcrypt.hash(password, 10)

  let checkTheUsername = `
            SELECT *
            FROM user
            WHERE username = '${username}';`
  let userData = await db.get(checkTheUsername)
  if (userData === undefined) {
    let postNewUserQuery = `
            INSERT INTO
            user (username,name,password,gender,location)
            VALUES (
                '${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
            );`
    if (password.length < 5) {
      //checking the length of the password
      response.status(400)
      response.send('Password is too short')
    } else {
      /*If password length is greater than 5 then this block will execute*/

      let newUserDetails = await db.run(postNewUserQuery) //Updating data to the database
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    /*If the userData is already registered in the database then this block will execute*/
    response.status(400)
    response.send('User already exists')
  }
})

// login API

app.post('/login', async (request, response) => {
  const {userName, password} = request.body
  const selectUserQuery = `select * from user where username='${userName}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    //   unregistered User
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      // success
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// API 3
app.put('/change-password', async (request, response) => {
  const {userName, oldPassword, newPassword} = request.body
  const selectUserQuery = `select * from user where username='${userName}'`
  const dbUser = await db.get(selectUserQuery)

  if (dbUser === undefined) {
    //   unregistered User
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(oldPassword, dbUser.password)
    if (isPasswordMatched === true) {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const updateQuery = `
    update user set password='${hashedPassword}' where username = '${userName}'`

        await db.run(updateQuery)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

module.exports = app
