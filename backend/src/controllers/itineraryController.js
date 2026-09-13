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

// @route   POST /api/itineraries/:id/ai-generate
// @desc    Generate AI itinerary recommendations and add them to existing trip
const generateAIItinerary = async (req, res) => {
  try {
    const { destination, startingFrom, days, startDate, budget, preferences } = req.body;
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const { generateItineraryPlan } = require('../utils/geminiService');
    const numDays = Number(days) || 3;
    const tripStart = startDate ? new Date(startDate) : (itinerary.startDate || new Date());
    const tripEnd = new Date(tripStart.getTime() + (numDays - 1) * 24 * 60 * 60 * 1000);

    const generatedItems = await generateItineraryPlan({
      destination,
      startingFrom,
      days: numDays,
      startDate: tripStart,
      budget: budget || 'moderate',
      preferences: preferences || ''
    });

    // Append generated items to destinations
    itinerary.destinations.push(...generatedItems);
    itinerary.startDate = tripStart;
    itinerary.endDate = tripEnd;

    // Update title if it's default
    if (itinerary.title === 'New Trip' || itinerary.title === 'Trip Planner' || itinerary.title === 'Next Adventure') {
      itinerary.title = `Trip to ${destination}`;
    }

    await itinerary.save();

    res.json({
      message: 'AI Itinerary generated successfully',
      destinations: itinerary.destinations,
      title: itinerary.title,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate AI itinerary'
    });
  }
};

// @route   POST /api/itineraries/ai-create
// @desc    Directly create a new itinerary with AI recommendations from Dashboard
const createAIItinerary = async (req, res) => {
  try {
    const { destination, startingFrom, days, startDate, budget, preferences } = req.body;
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const numDays = Number(days) || 3;
    const tripStart = startDate ? new Date(startDate) : new Date();
    const tripEnd = new Date(tripStart.getTime() + (numDays - 1) * 24 * 60 * 60 * 1000);

    const { generateItineraryPlan } = require('../utils/geminiService');
    const generatedItems = await generateItineraryPlan({
      destination,
      startingFrom,
      days: numDays,
      startDate: tripStart,
      budget: budget || 'moderate',
      preferences: preferences || ''
    });

    const newItinerary = await Itinerary.create({
      title: `Trip to ${destination}`,
      description: `AI-curated ${numDays}-day journey to ${destination} from ${startingFrom || 'origin'}`,
      createdBy: req.user._id,
      groupMembers: [req.user._id],
      startDate: tripStart,
      endDate: tripEnd,
      destinations: generatedItems
    });

    res.status(201).json(newItinerary);
  } catch (error) {
    console.error('AI Creation Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to create AI itinerary'
    });
  }
};

module.exports = {
  getItinerary,
  addDestination,
  createItinerary,
  getItineraries,
  addMember,
  updateItinerary,
  deleteItinerary,
  deleteDestination,
  generateAIItinerary,
  createAIItinerary
};
