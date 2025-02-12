
const pokemonModel = require('../models/pokemon')
const mongoose = require('mongoose');

const parseId = (id) => {
    try {
        return mongoose.Types.ObjectId.createFromHexString(id);
    } catch (error) {
        return null;
    }
    
}


exports.getData = async (req, res) => {
    try {
      const { types, abilities, page = 1, limit = 10 } = req.query;
  
      // Validar que 'page' y 'limit' sean números válidos
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
              if (isNaN(page) || page < 1) {
        return res.status(400).send({ error: "Invalid pagination: page must be a positive number" });
      }
  
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
        if (isNaN(limit) || limit < 1) {
        return res.status(400).send({ error: "Invalid pagination: limit must be a positive number" });
      }
  
      // Convertir page y limit a números
      const pageNumber = Number(page);
      const pageLimit = Number(limit);
  
      // Calcular el valor de 'skip' para la paginación
      const skip = (pageNumber - 1) * pageLimit;
  
      // Crear el filtro para los tipos y habilidades
      const filter = {};
      if (types) {
        filter.types = { $in: types.split(',').map(type => type.toLowerCase()) };
      }
      if (abilities) {
        filter.abilities = { $in: abilities.split(',').map(ability => ability.toLowerCase()) };
      }
  
      // Obtener los datos de la base de datos con los filtros
      const data = await pokemonModel.find(filter)
        .skip(skip)
        .limit(pageLimit)
        .select('_id name types thumbnailUrl');
  
      // Obtener el total de documentos que coinciden con el filtro
      const totalCount = await pokemonModel.countDocuments(filter);
  
      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalCount / pageLimit);
  
      // Responder con los datos y la paginación
      res.status(200).send({
        data,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems: totalCount,
          limit: pageLimit,
        },
      });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).send({ error: 'Error al obtener los datos' });
    }
  };
  
  

    
    exports.getById = async (req,res) => {
        try {
            const id = parseId(req.params.id);
            if (!id) return res.status(400).send({ error: 'Invalid id' });
            const data = await pokemonModel.findById(id);
            if (!data) return res.status(404).send({ error: 'Data not found' });
            res.status(200).send({ data });
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            res.status(400).send({ error: 'Error al obtener los datos' });
        }
    } 

    exports.insertData = async (req, res) => {
    try {
        const { name, img, thumbnailUrl, largeImageUrl, types, abilities, stats } = req.body;
        if (!stats || Object.values(stats).some(stat => stat <= 0)) {
            return res.status(400).send({ error: "All stats must be greater than 0" });
        }
        const existingPokemon = await pokemonModel.findOne({ name });
        if (existingPokemon) {
        return res.status(400).send({ error: "A Pokémon with this name already exists" });
        }
        
        const newPokemon = { name: name, img: img, thumbnailUrl: thumbnailUrl, largeImageUrl: largeImageUrl, types, abilities: abilities, stats: stats};

        const data = await pokemonModel.create(newPokemon);
        console.log("Created Pokemon:", data);


        res.status(201).send({ data });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
    }

exports.updateData = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).send({ error: "Invalid ID format" });
        }
        const updatedPokemon = await pokemonModel.findByIdAndUpdate(id, req.body, {
            new: true, 
            runValidators: true, 
        });
        if (!updatedPokemon) {
            return res.status(404).send({ error: "Pokemon not found" });
        }

        res.status(200).send({ data: updatedPokemon });

    } catch (error) {
        console.error("Error updating pokemon:", error);
        if (error instanceof mongoose.Error.ValidationError || error.name === "CastError") {
            // biome-ignore lint/style/useTemplate: <explanation>
            return res.status(400).send({ error: "validation error: " + error.message });
        }
        res.status(500).send({ error: 'Error updating pokemon' });
    }
}

exports.deleteData = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).send({ error: "Invalid ID format" });
        }
        const pokemon = await pokemonModel.findById(id);

        if (!pokemon) {
            return res.status(404).send({ error: 'Pokemon not found to delete' });
        }
        const result = await pokemonModel.deleteOne({_id: id})
        if(result.deletedCount === 0){
            return res.status(404).send({ error: 'the pokemon was not found to delete' });
        }
        res.status(200).send({ data: { message: 'Pokemon deleted successfully' } });
    } catch (error) {
        console.error("Error deleting pokemon:", error);
        res.status(500).send({ error: 'Error deleting pokemon' });
    }
}

