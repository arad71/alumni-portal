const express =require('express')
const router = express.Router();

router.get('/pay', (req, res) => {
    res.json({message: 'Payment route is working'})
});