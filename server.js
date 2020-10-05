const express = require('express')
const path = require('path')
const http = require('http')
const app = express()

const server = http.createServer(app)
const socektio = require('socket.io')
const io = socektio(server)

const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
    const botName = 'Chat Bot'

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin({ id: socket.id, username, room })

        socket.join(user.room)

        socket.emit('message', formatMessage(botName, 'Welcome to ChitChat!'))

        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

            io.to(user.room).emit('roomUsers',
                {
                    room: user.room,
                    users: getRoomUsers(user.room)
                }
            )
        }
    })
})

const PORT = process.env.PORT || 3002
server.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
})