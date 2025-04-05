const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!result.rows[0].is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
