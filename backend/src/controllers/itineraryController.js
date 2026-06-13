const Itinerary = require('../models/Itinerary');

// @route   GET /api/itineraries/:id
// @desc    Get itinerary by ID
const getItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findById(req.params.id).populate('groupMembers', 'name email');
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.json(itinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/itineraries/:id/destinations
// @desc    Add a place to itinerary
const addDestination = async (req, res) => {
  try {
    const { location, time, desc } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    let lat = 0;
    let lng = 0;
    try {
      const axios = require('axios');
      const nomRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
        headers: { 'User-Agent': 'TravelPlannerApp/1.0' }
      });
      if (nomRes.data && nomRes.data.length > 0) {
        lat = parseFloat(nomRes.data[0].lat);
        lng = parseFloat(nomRes.data[0].lon);
      }
    } catch (err) {
      console.error('Geocoding error', err);
    }

    itinerary.destinations.push({ location, lat, lng, time: new Date(), desc, notes: time }); // Storing time in notes for simplicity
    await itinerary.save();
    
    res.json(itinerary.destinations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/itineraries
// @desc    Create a new itinerary
const createItinerary = async (req, res) => {
  try {
    const { title } = req.body;
    const itinerary = await Itinerary.create({
      title: title || 'New Trip',
      createdBy: req.user._id,
      groupMembers: [req.user._id]
    });
    res.status(201).json(itinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/itineraries
// @desc    Get user's itineraries
const getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ groupMembers: req.user._id });
    res.json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/itineraries/:id/members
// @desc    Add a member to the itinerary by email
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the user to add
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });
    
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is already a member
    if (itinerary.groupMembers.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    itinerary.groupMembers.push(userToAdd._id);
    await itinerary.save();
    
    // Populate members before sending back so frontend has names
    await itinerary.populate('groupMembers', 'name email');

    res.json(itinerary.groupMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/itineraries/:id
// @desc    Update itinerary (e.g. title)
const updateItinerary = async (req, res) => {
  try {
    const { title } = req.body;
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    if (title) {
      itinerary.title = title;
      await itinerary.save();
    }
    
    res.json(itinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/itineraries/:id
// @desc    Delete itinerary and its expenses
const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Also delete associated expenses
    const Expense = require('../models/Expense');
    await Expense.deleteMany({ itineraryId: req.params.id });
    
    await itinerary.deleteOne();
    res.json({ message: 'Itinerary removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/itineraries/:id/destinations/:destId
// @desc    Delete a destination from itinerary
const deleteDestination = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    itinerary.destinations = itinerary.destinations.filter(
      (dest) => dest._id.toString() !== req.params.destId
    );

    await itinerary.save();
    res.json(itinerary.destinations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getItinerary, addDestination, createItinerary, getItineraries, addMember, updateItinerary, deleteItinerary, deleteDestination };
