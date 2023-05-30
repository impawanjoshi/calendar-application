const mongoSetup = require('../../mongoConnection');
const config = require('../../config')
const axios = require('axios');
const _ = require('lodash');

db = mongoSetup.getDatabase().collection(config.collectionName)

async function fetchEventsFromOutlook(accessToken) {
    try {
        const response = await axios.get(config.outlookApiEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json'
            }
        });

        return response.data.value;
    } catch (error) {
        console.error('Error fetching events from outlook:', error.message);
        throw error;
        // In case token is not getting generated then we can return below statement to test
        // return [{
        //     eventId: "1234",
        //     title: "my meeting",
        //     startTime: "2023-06-01T09:00:00Z",
        //     endTime: "2023-06-01T10:00:00Z"
        // }]
    }
}

// Sync events from Outlook calendar
async function syncEvents(accessToken) {
    try {

        let outlookEvents = await fetchEventsFromOutlook(accessToken);
        let existingEvents = await getEventsFromDB();

        const existingEventsMap = existingEvents.reduce((map, event) => {
            map[event.eventId] = event;
            return map;
        }, {});

        for (const outlookEvent of outlookEvents) {
            let newEvent = _.pick(outlookEvent, ["eventId", "title", "startTime", "endTime"]);
            if (existingEventsMap[outlookEvent.eventId]) {
                let oldEvent = _.pick(existingEventsMap[outlookEvent.eventId], ["eventId", "title", "startTime", "endTime"]);

                if (!_.isEqual(oldEvent, newEvent)) {
                    const filter = { _id: existingEventsMap[outlookEvent.eventId]._id };
                    let update = { $set: newEvent }
                    db.updateOne(filter, update)
                    console.log('Updated event:', outlookEvent.title);
                }

            } else {// create if event don't exists
                await insertEventToDB(newEvent);
                console.log('Created event:', outlookEvent.title);
            }
        }

        // Delete events that no longer exist in the Outlook calendar
        const deletedEventIds = existingEvents
            .filter(event => !outlookEvents.find(outlookEvent => outlookEvent.eventId == event.eventId))
            .map(event => event.eventId);

        await db.deleteMany({ eventId: { $in: deletedEventIds } });

        console.log('Sync completed.');
    } catch (error) {
        console.error('Error syncing events:', error.message);
        throw error;
    }
}

async function insertEventToDB(newEvent) {
    await db.insertOne(newEvent);
    console.log('Created event:', newEvent.title);
    return;
}

async function getEventsFromDB(eventId = null) {
    let query = {};
    if(eventId!=null){
        _.set(query,'eventId', eventId);
    }
    let resp = await db.find(query).toArray();
    return resp;
}

async function deleteEventFromDB(eventId = null) {

    if(eventId==null){
        return "event ID cannot be null"
    }
    await db.deleteMany({ eventId: { $in: [eventId] } });
    return "event deleted successfully";
}

module.exports = {
    fetchEventsFromOutlook,
    syncEvents,
    getEventsFromDB,
    insertEventToDB,
    deleteEventFromDB
}