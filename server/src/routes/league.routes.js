const { Router } = require('express');
const LeagueController = require('../controllers/league.controller');

const router = Router();

router.get('/', LeagueController.getAll);
router.get('/:id/teams', LeagueController.getTeams);

module.exports = router;
