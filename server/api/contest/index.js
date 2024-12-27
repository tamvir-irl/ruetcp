// contestRouter.js
import express from 'express';
import Contest from '../../Schemas/contest.js';  // Adjust the path to your model

const router = express.Router();

// POST route to add a new contest
router.post('/add', async (req, res) => {
  const { contestName, contestUrl, startTime, endTime } = req.body;

  // Validate the input
  if (!contestName || !contestUrl || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Create a new contest object
  const newContest = new Contest({
    contestName,
    contestUrl,
    startTime,
    endTime,
    phase: 'BEFORE',  // Set initial phase to BEFORE
  });

  try {
    // Save the new contest to the database
    await newContest.save();
    res.status(201).json({ message: 'Contest created successfully', contest: newContest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating contest' });
  }
});
router.get('/all', async (req, res) => {
    try {
      const contests = await Contest.find().sort({createdAt: -1}); // Fetch all contests from the database
      res.status(200).json({ contests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching contests' });
    }
});
// GET route to fetch the latest contest
router.get('/latest', async (req, res) => {
    try {
      const latestContest = await Contest.findOne().sort({ createdAt: -1 }); // Sort by startTime descending
      if (!latestContest) {
        return res.status(404).json({ error: 'No contests found' });
      }
      res.status(200).json({ contest: latestContest });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching latest contest' });
    }
  });
  
  // GET route to fetch an individual contest by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const contest = await Contest.findById(id);
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }
      res.status(200).json({ contest });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching contest by ID' });
    }
  });
export default router;
