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

app.get('/api/mesas', async (req, res) => {
    try {
        const db = app.locals.db;
        const mesas = await db.collection('mix').find().toArray();
        res.send(mesas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las mesas' });
    }
});

app.post('/api/anyadir', async (req, res) => {
    try {
        let { color, material, patas, tamanyo } = req.body

        const results = await app.locals.db.collection('mix').insertOne({ color, material, patas, tamanyo })
        res.send({ mensaje: "Ha sido añadido" + results })

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las mesas' });
    }
})

app.put('/api/modificar/:color', async (req, res)=>{
    try {
        const results = await app.locals.db.collection('mix').updateMany(
            {color: req.params.color},
            {$set: {color: "granate"}}
        )
        res.status(200).send({ mensaje: "Producto modificado", results })
    } catch (error) {
        res.status(500).send({mensaje: "Error al modificar"})
    }
})

app.delete('/api/eliminar/:patas', async (req, res) => {
    try {
        const results = await app.locals.db.collection('mix').deleteMany(
            {patas: parseInt(req.params.patas)}
        )
        res.status(200).send({ mensaje: "Producto borrado", results })
    } catch (error) {
        res.status(500).send({ mensaje: "Error al borrar" })
    }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});