
const pokemonModel = require('../models/pokemon')
const mongoose = require('mongoose');

const parseId = (id) => {
    return mongoose.Types.ObjectId.createFromHexString(id);
}


exports.getData = async (req, res) => {
    try {
        const { types, abilities } = req.query;   
        let { page, limit } = req.query; 
        console.log("tipo", types);
        
        if (!page || Number.isNaN(Number(page)) || page < 1) page = 1;
        if (!limit || Number.isNaN(Number(limit)) || limit < 1) limit = 10;
        
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        const skip = (pageNumber - 1) * pageLimit;

        const filter= {};
         if (types) {
            filter.types = { $in: types.split(',').map(type => type.toLowerCase()) };
        }
         if (abilities) {
            filter.abilities = { $in: abilities.split(',').map(ability => ability.toLowerCase()) };
        }
        const data = await pokemonModel.find(filter)
            .skip(skip)
            .limit(pageLimit);
            const totalCount = await pokemonModel.countDocuments(filter);   
            res.status(200).send({
                data,
                pagination: {
                    total: totalCount,
                    page: pageNumber,
                    limit: pageLimit,
                    totalPages: Math.ceil(totalCount / pageLimit),
                },
            });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).send({ error: 'Error al obtener los datos' });
    }
};  

    exports.insertData = async (req, res) => {
    try {
        const { name, img, thumbnailUrl, largeImageUrl, types, abilities, stats } = req.body;
        if (!stats.hp || stats.hp <= 0) {
            return res.status(400).send({ error: "HP must be greater than 0" });
        }
        if (!stats.attack || stats.attack <= 0) {
            return res.status(400).send({ error: "Attack must be greater than 0" });
        }
        if (!stats.defense || stats.defense <= 0) {
            return res.status(400).send({ error: "Defense must be greater than 0" });
        }
        if (!stats.specialAttack || stats.specialAttack <= 0) {
            return res.status(400).send({ error: "Special Attack must be greater than 0" });
        }
        if (!stats.specialDefense || stats.specialDefense <= 0) {
            return res.status(400).send({ error: "Special Defense must be greater than 0" });
        }
        if (!stats.speed || stats.speed <= 0) {
            return res.status(400).send({ error: "Speed must be greater than 0" });
        }
        const newPokemon = { name: name, img: img, thumbnailUrl: thumbnailUrl, largeImageUrl: largeImageUrl, types, abilities: abilities, stats: stats};

        const data = await pokemonModel.create(newPokemon);


        res.status(201).send({ data });
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

