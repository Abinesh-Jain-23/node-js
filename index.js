const express = require('express')
const cors = require('cors');
const { Client, Databases } = require('node-appwrite');
const app = express()


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6666e8f90025c5f4662c');

const databases = new Databases(client);

app.get('/', async (req, res) => {
    const data = await databases.listDocuments('66693da4001556742582', '66696cdc000fd5d4b5e2');
    res.send({ data })
})  


app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const document = await databases.getDocument('66693da4001556742582', '66696cdc000fd5d4b5e2', id);
        if (!document) return res.sendStatus(404);
        const updatedDocument = await databases.updateDocument('66693da4001556742582', '66696cdc000fd5d4b5e2', id, { clicks: (document.clicks || 0) + 1 });
        res.redirect(updatedDocument.fullURL);
    } catch (error) {
        res.sendStatus(404)
    }
})

app.listen(process.env.PORT || 3000, () => console.log('Server Started at ' + 3000));