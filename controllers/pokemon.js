
const pokemonModel = require('../models/pokemon')
const mongoose = require('mongoose');

const parseId = (id) => {
    return mongoose.Types.ObjectId.createFromHexString(id);
}


exports.getData = async (req, res) => {
    try {
        const data = await pokemonModel.find(); // Consulta los datos en la colección "pokemons"
        res.status(200).send({ data });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send({ error: 'Error al obtener los datos' });
    }
};

exports.insertData = async (req, res) => {
try {
    const { name, img, thumbnailUrl, largeImageUrl, types, abilities, stats } = req.body;
    const newPokemon = { name: name, img: img, thumbnailUrl: thumbnailUrl, largeImageUrl: largeImageUrl, abilities: abilities, stats: stats};

    const data = await pokemonModel.create(newPokemon);

    res.send({ data });
} catch (err) {
    res.status(400).send({ error: err.message });
 }
}

exports.updateData = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        result = await pokemonModel.updateOne({_id: parseId(id)}, body)
        if(result.matchedCount === 0){
            return res.status(404).send({ message: 'the pokemon was not found to update' });
        }
        if (result.modifiedCount === 0) {
            return res.status(200).send({ message: 'there were no changes to the pokemon' });
        }
        res.send({ message: 'pokemon updated successfully' });

    } catch (error) {
        console.error("Error updating pokemon:", error);
        res.status(500).send({ error: 'Error updating pokemon' });
    }
}

exports.deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pokemonModel.deleteOne({_id: parseId(id)})
        if(result.deletedCount === 0){
            return res.status(404).send({ message: 'the pokemon was not found to delete' });
        }
        res.send({ message: 'pokemon deleted successfully' });
    } catch (error) {
        console.error("Error deleting pokemon:", error);
        res.status(500).send({ error: 'Error deleting pokemon' });
    }
}

