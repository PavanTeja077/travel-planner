const express = require('express');
const router = express.Router();
const { getItinerary, addDestination, createItinerary, getItineraries, addMember, updateItinerary, deleteItinerary, deleteDestination, generateAIItinerary } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createItinerary).get(protect, getItineraries);
router.route('/:id').get(protect, getItinerary).put(protect, updateItinerary).delete(protect, deleteItinerary);
router.route('/:id/destinations').post(protect, addDestination);
router.route('/:id/destinations/:destId').delete(protect, deleteDestination);
router.post('/:id/members', protect, addMember);
router.post('/:id/ai-generate', protect, generateAIItinerary);

module.exports = router;
