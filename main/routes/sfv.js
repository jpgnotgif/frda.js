'use strict';

const express = require('express');
const _       = require('lodash');

const router = express.Router();
const game = 'sfv';

const Character = require('../resources/character');
const Characters = require('../resources/characters');

router.get('/s:version/characters', (req, res, next) => {
  const characters = new Characters(game, req.params.version);

  characters.list()
    .then((names) => {
      res.status(200).json({
        game, characters: names
      });
    })
    .catch((err) => {
      res.status(404).json({
        game, message: err.message
      });
    });
});

router.get('/s:version/:name', function(req, res, next) {
  const attrs = {
    game,
    normalsOnly: req.query.normals || false,
    name: req.params.name,
    version: req.params.version
  };

  const character = new Character(attrs);

  if (!(character.validVersion())) {
    res.status(400).json({
      game, message: 'Version must either be "1" or "2"'
    });
  }

  character.exists()
    .then((character) => {
      character.frames()
        .then((data) => {

          if (character.normalsOnly) {
            const frameData = JSON.parse(data);
            const filteredData = {
              metadata: frameData.metadata,
              attacks: {}
            };

            const normals = _.each(frameData.attacks, (obj, name) => {
              if (obj.normal)
                filteredData.attacks[name] = obj;
            });

            res.send(filteredData);
          } else {
            res.send(data);
          }
        })
        .catch((err) => {
          res.status(404).json({
            game, message: err.message
          });
        });
    })
    .catch((err) => {
      res.status(404).json({
        game, message: err.message
      });
    });
});

module.exports = router;
