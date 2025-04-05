const express =require('express')
const router = express.Router();

router.get('/member', (req, res) => {
    res.json({message: 'Members route is working'})
});