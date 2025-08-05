const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password
    });

    // Generate token
    const token = generateToken(user.id);

    // Return success response (don't send password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Check if Google user exists
const checkGoogleUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    // Check if user exists with Google ID or email
    let user = await User.findByGoogleId(googleId);
    if (!user) {
      user = await User.findByEmail(email);
    }

    res.status(200).json({
      success: true,
      exists: !!user
    });

  } catch (error) {
    console.error('Check Google user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user check'
    });
  }
};

// Google OAuth login
const googleLogin = async (req, res) => {
  try {
    const { token, role, vendorProfile } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with Google ID
    let user = await User.findByGoogleId(googleId);

    if (user) {
      // User exists, generate JWT token
      const jwtToken = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profilePicture: user.profilePicture
          },
          token: jwtToken
        }
      });
    }

    // Check if user exists with same email
    user = await User.findByEmail(email);

    if (user) {
      // User exists with same email, link Google account
      user.googleId = googleId;
      user.name = user.name || name;
      user.profilePicture = user.profilePicture || picture;
      await user.save();

      const jwtToken = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'Google account linked and login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profilePicture: user.profilePicture
          },
          token: jwtToken
        }
      });
    }

    // Validate and set role for new user (admin not allowed via Google OAuth)
    let userRole = 'user'; // default
    if (role && ['user', 'vendor'].includes(role)) {
      userRole = role;
    }

    // Security check: prevent admin role creation via Google OAuth
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be created via Google OAuth for security reasons.'
      });
    }

    console.log('Creating new Google user with role:', userRole); // Debug log

    // Create new user with selected role
    user = await User.create({
      googleId,
      email,
      name,
      profilePicture: picture,
      role: userRole
    });

    console.log('Created user with role:', user.role); // Debug log

    // If vendor role and vendor profile data provided, create vendor profile
    if (userRole === 'vendor' && vendorProfile) {
      const VendorProfile = require('../models/vendorProfile');

      await VendorProfile.create({
        user_id: user.id,
        business_name: vendorProfile.businessName,
        contact_name: vendorProfile.contactName,
        mobile_number: vendorProfile.mobileNumber,
        gst_number: vendorProfile.gstNumber,
        business_address: vendorProfile.businessAddress,
        bank_name: vendorProfile.bankName,
        pan_number: vendorProfile.panNumber
      });

      console.log('Created vendor profile for Google OAuth user');
    }

    const jwtToken = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Google registration and login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture
        },
        token: jwtToken
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during Google login'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  googleLogin,
  checkGoogleUser
};
