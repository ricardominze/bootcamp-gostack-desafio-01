const express = require('express');

//Instância do express para servidor.
const server = express();

//Comunicação do servidor em JSON.
server.use(express.json());

//Vetores para armazenagem dos dados a aplicação.
const db  = [];
const requests = [];

/*
 * Middleware Global.
 * Chmado antes de qualquer função
 * seja um Middleware Local ou uma
 * rota.
 * 
*/
server.use((req, res, next) => {

  requests.push(`Metodo: ${req.method}; URL ${req.url}`);
  console.log(`Total Requests: ${requests.length}`);
  next();
});

/*
 * Middlewares Locais.
 * Podem ser chamados para validacoes 
 * antes da execução da rota chamada,
 * pode ser utilizada para validações.
*/
function MiddleWareCheckId (req, res, next)  {

  if(!req.params.id) {
    return req.status(400).json({error : 'The ID of project is required!'});
  }
  return next();
}

function MiddleWareCheckTitle (req, res, next)  {

  if(!req.body.title) {
    return req.status(400).json({error : 'The TITLE of project is required!'});
  }
  return next();
}

function MiddleWareCheckProject (req, res, next)  {
  
  const index = findIndex(req.params.id);
  if(index == null) {
    return res.status(400).json({error : 'The PROJECT not exists!'});
  }
  return next();
}

/*
 * Find.
 * Função para auxiliar na busca do registro
*/

function findIndex(id) {

  let index = null;
  if(db.length > 0) {
    index = 0;
    for (const row of db) {
      if(id == row.id){
        break;
      }
      index++;
    }
  }
  return index;
}


/*
 * Rotas.
 * Funções registradas para tratar as
 * requisições HTTP (GET, PUT, DELETE, POST).
*/

server.post('/projects', (req, res) => {

  const { id, title} = req.body;
  db.push({id, title, tasks:[]});
  
  return res.status(200).json({sucess: `The project (${title}) was created com Id (${id})`});
});

server.get('/projects', (req, res) => {

  return res.json(db);
});

server.put('/projects/:id', MiddleWareCheckId, MiddleWareCheckTitle, MiddleWareCheckProject, (req, res) => {

  const { id }   = req.params;
  const newTitle = req.body.title;
  const index    = findIndex(id);
  const project  = db[index];
  const oldTitle = project.title;

  return res.status(200).json({sucess: `The project title (${oldTitle}) has been updated to (${newTitle})`});
});

server.delete('/projects/:id', MiddleWareCheckId, MiddleWareCheckProject, (req, res) => {

  const { id } = req.params;
  const index = findIndex(id);
  const project = db[index];
  db.splice(index, 1);

  return res.send(`The project (${project.title}) has been deleted.`);
});

server.post('/projects/:id/tasks', MiddleWareCheckId, MiddleWareCheckProject, (req, res) => {

  const { id } = req.params;
  const { title } = req.body;
  const index = findIndex(id);
  db[index].tasks.push(title);

  return res.status(200).json({sucess: 'The task has been added to the project'});
});

server.listen('3000');