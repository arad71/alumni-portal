const express =require('express')
const router = express.Router();

router.get('/event', (req, res) => {
    res.json({message:'Events route is working'})
});