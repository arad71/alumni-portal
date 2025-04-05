const express =require('express')
const router = express.Router();

router.get('/auth', (req, res) => {
    res.json({message: 'Auth route is working'})
});