const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isValidPassword, PASSWORD_HINT } = require('../utils/password');

/**
 * User 컨트롤러 ≈ UserController + AuthService
 *
 * 회원가입 POST /api/users
 * 로그인   POST /api/users/login → JWT 발급 (세션 대신 토큰)
 * 내정보   GET  /api/users/me   → authenticateToken 후 req.user
 */

/**
 * JWT 토큰 발급 (로그인 성공 시에만 호출)
 *
 * - DB에 토큰을 저장하지 않음. 응답으로만 전달
 * - payload(id, email, user_type)는 누구나 디코딩해 볼 수 있음 (비밀 아님)
 * - 위조 방지는 JWT_SECRET 서명으로 함 → authenticateToken의 jwt.verify가 검증
 * - 만료: .env 의 JWT_EXPIRES_IN (기본 7d)
 */
const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      user_type: user.user_type,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/users — 회원가입 (공개 라우트)
const createUser = async (req, res, next) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    const user = await User.create({
      email,
      name,
      password,
      user_type: user_type || 'customer',
      address,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/login — 로그인 + JWT 발급
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해 주세요.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/me/password — 비밀번호 변경
 * 현재 비밀번호 확인 후 새 비밀번호 저장 (bcrypt는 User pre('save'))
 */
const changePassword = async (req, res, next) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호와 새 비밀번호를 입력해 주세요.',
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: PASSWORD_HINT,
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me — 현재 로그인 유저
 * 라우트: router.get('/me', authenticateToken, getMe)
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    const { email, name, password, user_type, address } = req.body;
    if (email !== undefined) user.email = email;
    if (name !== undefined) user.name = name;
    if (user_type !== undefined) user.user_type = user_type;
    if (address !== undefined) user.address = address;
    if (password !== undefined) user.password = password;
    await user.save();
    res.json({ success: true, data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  changePassword,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
