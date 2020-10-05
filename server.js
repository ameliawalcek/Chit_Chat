const express = require('express')
const path = require('path')
const http = require('http')
const socektio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socektio(server)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
    console.log('New websocket connection..')
    
    //emits to the client connecting
    socket.emit('message', 'Welcome to ChatRoom!')

    //Broadcast when a user connects (not the one connecting)
    socket.broadcast.emit('message', 'A user has joined the chat')

    //When client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat :(')
    })

    //to all clients
    io.emit('')
})

const PORT = process.env.PORT || 3002
server.listen(PORT, ()=> {
    console.log(`server running on ${PORT}`)
})