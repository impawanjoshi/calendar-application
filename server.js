const express = require('express');
const _ = require('lodash');
const mongoSetup = require('./mongoConnection')
const config = require('./config');
const app = express();
const handler = require('./api/v1/handler')

app.listen(config.nodePort, () => {
  console.log(`Server started on port ${config.nodePort}`);
});
app.use(express.json())

mongoSetup.connectToDB();

//Routes

//request - http://localhost:8080/sync
app.get('/sync', async (req, res) => {
  const accessToken = req.headers.authorization; // need to get this in headers
  await handler.syncEvents(accessToken);
  res.send('Events synced successfully.');
});

//request - http://localhost:8080/getEvents
app.get('/getEvents', async (req, res) => {
  let resp = await handler.getEventsFromDB();
  res.send(resp);
});

//request - http://localhost:8080/getEvent/:eventId
app.get('/getEvent/:id', async (req, res) => {
  let resp = await handler.getEventsFromDB(req.params.id);
  res.send(resp);
});

// request - http://localhost:8080/createEvent
// sample req body - `{"eventId": "1234568","title": "my meeting","startTime": "2023-06-01T09:00:00Z","endTime": "2023-06-01T10:00:00Z"}
app.post('/createEvent', async (req, res) => {
  let resp = await handler.insertEventToDB(req.body);
  res.send('Events created successfully.');
});

//request - http://localhost:8080/deleteEvent/:eventId
app.post('/deleteEvent', async (req, res) => {
  let resp = await handler.deleteEventFromDB(req.params.id);
  res.send(resp);
});

