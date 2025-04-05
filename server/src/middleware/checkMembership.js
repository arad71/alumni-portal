const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // First check if user is admin
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is admin, allow access
    if (userResult.rows[0].is_admin) {
      return next();
    }
    
    // Check if user has active membership
    const membershipResult = await pool.query(
      `SELECT * FROM memberships 
       WHERE user_id = $1 
       AND end_date >= CURRENT_DATE 
       AND is_active = TRUE`,
      [req.user.userId]
    );
    
    if (membershipResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Membership required to access this resource' 
      });
    }
    
    // User has active membership, proceed
    next();
  } catch (err) {
    console.error('Membership check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
