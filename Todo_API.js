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
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and status = '${status}' and priority = '${priority}'`
      break
    case hasPriorityProperty(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and priority = '${priority}'`
      break
    case hasStatusProperty(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%' and status = '${status}'`
      break

    default:
      getTodoQuery = `select * from todo where todo like '%${search_q}%'`
      break
  }

  const dbResponse = await db.all(getTodoQuery)
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
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {priority, status, todo} = request.body
  let updateCoulmn
  switch (true) {
    case status !== undefined:
      updateCoulmn = 'Status'
      updateQuery = `update todo set status = '${status}' where id=${todoId}`
      break
    case priority !== undefined:
      updateCoulmn = 'Priority'
      updateQuery = `update todo set priority = '${priority}' where id=${todoId}`
      break

    default:
      updateCoulmn = 'Todo'
      updateQuery = `update todo set todo = '${todo}' where id=${todoId}`
      break
  }

  await db.all(updateQuery)
  response.send(`${updateCoulmn} Updated`)
})

// API 5

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const query = `delete from todo where id=${todoId}`

  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
