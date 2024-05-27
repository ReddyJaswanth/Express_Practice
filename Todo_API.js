const express = require('express')
const app = express()
app.use(express.json())

const sqlite3 = require('sqlite3')
const path = require('path')
const {open} = require('sqlite')
// const bcrypt = require('bcrypt')

let db = null

const dbpath = path.join(__dirname, 'todoApplication.db')

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

// API 1
// scenario 1
app.get('/todos/', async (request, response) => {
  const {status} = request.query

  const todoQuery = `select * from todo where status = '${status}'`
  const dbResponse = await db.all(todoQuery)
  response.send(dbResponse)
})

// scenario 2
app.get('/todos/', async (request, response) => {
  const {priority} = request.query

  const todoQuery = `select * from todo where priority = '${priority}'`
  const dbResponse = await db.all(todoQuery)
  response.send(dbResponse)
})

// scenario 3
app.get('/todos/', async (request, response) => {
  const {priority, status} = request.query

  const todoQuery = `select * from todo where priority = '${priority}' and status = '${status}'`
  const dbResponse = await db.all(todoQuery)
  response.send(dbResponse)
})

// scenario 4
app.get('/todos/', async (request, response) => {
  const {search_q = ''} = request.query

  const todoQuery = `select * from todo where todo LIKE '%${search_q}%'`
  const dbResponse = await db.all(todoQuery)
  response.send(dbResponse)
})

// API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const query = `select * from todo where id=${todoId}`

  const dbResponse = await db.get(query)
  response.send(dbResponse)
})

// API 3

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body

  const todoQuery = `insert into todo values(${id}, '${todo}', '${priority}', '${status}')`
  const dbResponse = await db.run(todoQuery)
  const todoId = dbResponse.lastID
  response.send('Todo Successfully Added')
})

// API 4
// scenario 1
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {status} = request.body

  const query = `update todo set status='${status}' where id=${todoId}`

  await db.run(query)
  response.send('Status Updated')
})

// scenario 2
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {priority} = request.body

  const query = `update todo set priority='${priority}' where id=${todoId}`

  await db.run(query)
  response.send('Priority Updated')
})

// scenario 3
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {todo} = request.body

  const query = `update todo set todo='${todo}' where id=${todoId}`

  await db.run(query)
  response.send('Todo Updated')
})

// API 5

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const query = `delete from todo where id=${todoId}`

  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
