const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Armazena nome → socket.id
const usuarios = {};

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Registrar usuário
  socket.on("registrar usuario", (nome) => {
    usuarios[nome] = socket.id;
    console.log("Usuários conectados:", usuarios);
  });

  // Mensagem normal
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  // Mensagem privada
  socket.on("mensagem privada", (dados) => {
    const { de, para, mensagem } = dados;

    if (usuarios[para]) {
      // Envia para o destinatário
      io.to(usuarios[para]).emit("mensagem privada", { de, mensagem });

      // Mostra também para o remetente
      socket.emit("mensagem privada", { de, mensagem });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);

    for (const nome in usuarios) {
      if (usuarios[nome] === socket.id) {
        delete usuarios[nome];
        break;
      }
    }
  });
});

http.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 - http://localhost:3000");
});
