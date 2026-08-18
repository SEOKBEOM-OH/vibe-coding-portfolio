const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User 스키마 ≈ @Entity(User)
 * timestamps → @CreatedDate / @LastModifiedDate
 * pre('save')에서 bcrypt 해시 (PasswordEncoder)
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      select: false, // 조회 API 응답에 기본적으로 포함하지 않음
    },
    user_type: {
      type: String,
      required: [true, 'user_type is required'],
      enum: {
        values: ['customer', 'admin', 'seller'],
        message: 'user_type must be customer, admin, or seller',
      },
      default: 'customer',
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,  // createdAt, updatedAt
  }
);

// User.create / user.save() 직전에 비밀번호 해시
userSchema.pre('save', async function (next) {
  // password 필드가 안 바뀌었으면 다시 해시하지 않음
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// JSON/객체로 변환할 때 password 필드 제거 (응답 Preview 노출 방지)
const stripPassword = (_doc, ret) => {
  delete ret.password;
  return ret;
};

userSchema.set('toJSON', { transform: stripPassword });
userSchema.set('toObject', { transform: stripPassword });

// 로그인 시 입력 비밀번호(평문)와 DB에 저장된 bcrypt 해시 비교
// userController.loginUser 에서 user.comparePassword(password)로 호출
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
