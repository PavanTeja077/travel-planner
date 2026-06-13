const express = require('express');
const router = express.Router();
const { getItinerary, addDestination, createItinerary, getItineraries, addMember, updateItinerary, deleteItinerary, deleteDestination } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createItinerary).get(protect, getItineraries);
router.route('/:id').get(protect, getItinerary).put(protect, updateItinerary).delete(protect, deleteItinerary);
router.route('/:id/destinations').post(protect, addDestination);
router.route('/:id/destinations/:destId').delete(protect, deleteDestination);
router.post('/:id/members', protect, addMember);

module.exports = router;
