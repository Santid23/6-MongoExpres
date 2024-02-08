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



app.get('/api/libros', async (req, res) => {
    try {
        const db = app.locals.db;
        const libros = await db.collection('libros').find().toArray();
        res.send(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las mesas' });
    }
});

app.get('/api/libros/:titulo', async function(req,res){
    try {
        const db = app.locals.db;
        const libros = await db.collection('libros').find({titulo: req.params.titulo}).toArray();
        res.send(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las mesas' });
    }
});

app.post('/api/nuevoLibro/:titulo', async (req, res) => {
    try {

        const results = await app.locals.db.collection('libros').insertOne({ titulo: req.params.titulo, leido: false })
        res.send({ mensaje: "Ha sido añadido", results })

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener las mesas' });
    }
})

app.put('/api/editarLibro/:titulo', async (req, res)=>{
    try {
        const results = await app.locals.db.collection('libros').updateOne(
            {titulo: req.params.titulo},
            {$set: {leido: true}}
        )
        res.status(200).send({ mensaje: "Producto modificado", results })
    } catch (error) {
        res.status(500).send({mensaje: "Error al modificar"})
    }
})

app.delete('/api/borrarLibro/:titulo', async (req, res) => {
    try {
        const results = await app.locals.db.collection('libros').deleteOne(
            {titulo: req.params.titulo}
        )
        results.deleteCount < 1
        ? res.send({ mensaje: "Producto no borrado", results })
        : res.status(200).send({ mensaje: "Producto borrado", results })
    } catch (error) {
        res.status(500).send({ mensaje: "Error al borrar" })
    }
})



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});