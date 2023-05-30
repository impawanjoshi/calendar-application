module.exports = {
    nodePort : 8080,

    mongoConnectionString: "mongodb://127.0.0.1:27017/?directConnection=true",
    dbName: 'local',
    collectionName: "outlook_events",

    outlookAccessToken: "",
    outlookApiEndpoint: 'https://graph.microsoft.com/v1.0/me/events'
}