const express =require('express')
const router = express.Router();

router.get('/user', (req, res) => {
    res.json({message: 'users route is working'})
});