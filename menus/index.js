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

app.get('/api/menus', async (req, res) => {
    try {
        const db = app.locals.db;
        const menus = await db.collection('menus').find().toArray();
        res.send(menus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los menús' });
    }
});

app.post('/api/nuevoMenu', async (req, res)=>{
    try {
        const {numero, primerPlato, segundoPlato, postre, precio} = req.body
        const results = await app.locals.db.collection('menus').insertOne({numero, primerPlato, segundoPlato, postre, precio})
        const menus = await app.locals.db.collection('menus').find({}).toArray();
        res.send({mensaje: "Menú añadido.", results, menus})
    } catch (error) {
         console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los menús' });
    }
})

app.put('/api/editarMenu', async(req,res)=>{
    try {
        const {numero, primerPlato, segundoPlato, postre, precio} = req.body
        const results = await app.locals.db.collection('menus').updateOne(
            {numero: parseInt(numero)}, 
            {$set: {primerPlato, segundoPlato, postre, precio: parseInt(precio)}})
        const menus = await app.locals.db.collection('menus').find({}).toArray();
        res.send({mensaje: "Menús", results, menus})
    } catch (error) {
         console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los menús' });
    }
})

app.delete('/api/borrarMenu', async (req, res) => {
    try {
        const results = await app.locals.db.collection('menus').deleteOne({numero: parseInt(req.body.numero)});
        res.send({mensaje: "Menú eliminado.", results});
    } catch (error) {
         console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los menús' });
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