const express =require('express')
const router = express.Router();

router.get('/reg', (req, res) => {
    res.json({message: 'Reg route is working'})
});