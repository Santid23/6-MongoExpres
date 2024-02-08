const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.use(express.urlencoded({extended: false}))
app.use(express.json())

async function conectarDB() {
    try {
        await client.connect({ dbName: 'mongo_express' });
        console.log('Conexión exitosa a MongoDB');

        app.locals.db = client.db('mongo_express');
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error);
    }
}

conectarDB();

app.use(express.static('public'))

app.get('/api/series', async (req, res) => {
    try {
        const db = app.locals.db;
        const results = await db.collection('series').find().toArray();
        res.send(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las series' });
    }
});




app.post('/api/nuevaSerie', async(req, res) => {
    try {
        let {titulo, plataforma, nota} = req.body
        nota = parseInt(nota)
        let results = await app.locals.db.collection('series').insertOne({titulo, plataforma, nota})
        res.send("Serie añadida", results)
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'No se ha añadido' });
        
    }
})


app.get('/api/:serie', async (req, res) => {
    try {
        const db = app.locals.db;
        const results = await db.collection('series').find({ titulo: req.params.titulo}).toArray();
        results.length > 0
        ? res.send({ mensaje: "Serie no encontrada", results })
        : res.status(200).send({ mensaje: "Serie encontrada", results })
    }catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la serie' });
    }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});