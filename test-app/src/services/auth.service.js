const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

const User = require("./../models/user.model");
const Token = require("./../models/token.model");
const MailServ = require("./../services/mail.service");
const config = require("./../config");
const { CustomError } = require("./../utils");


class AuthService {
  /** 
   * User sign-up method 
   * @param {Object} data  Request Body
   * @returns {Object} { user_id, email, role, has_verified_email, auth_token }
   */
  async signup(data) {
    const { name, email, password } = data
    const existingUser = await User.findOne({ email })
    if (existingUser) throw new CustomError("Email already exists");

    const user = await new User({
      name,
      email,
      password
    }).save();

    // Send email verification mail
    await AuthService.requestEmailVerification(user)

    const auth_token = jwt.sign(
      { user_id: user._id, role: user.role },
      config.jwt.AUTH_SECRET,
      { expiresIn: "30 days" }
    );

    return {
      user_id: user._id,
      email: user.email,
      role: user.role,
      has_verified_email: user.has_verified_email,
      auth_token
    };
  }

  /** 
   * User sign-in method 
   * @param {Object} data  Request Body
   * @returns {Object} { user_id, email, role, has_verified_email, auth_token }
   */
  async signin(data) {
    const { email, password } = data

    if (!email) throw new CustomError("Email is required");
    if (!password) throw new CustomError("Password is required");

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("Incorrect email or password");

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw new CustomError("Incorrect email or password");

    const auth_token = jwt.sign(
      { user_id: user._id, role: user.role },
      config.jwt.AUTH_SECRET,
      { expiresIn: "30 days" }
    );

    return {
      user_id: user._id,
      email: user.email,
      role: user.role,
      has_verified_email: user.has_verified_email,
      auth_token
    };
  }


  /** 
   * Request email verification by sending OTP to user email
   * @param {Object} data  Request Body
   * @returns {Object}
   */
   static async requestEmailVerification(data) {
    const { email } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")
    if (user.has_verified_email) throw new CustomError("Email is already verified")

    let token = await Token.findOne({ userId: user._id })
    if (token) await token.deleteOne()

    let otp = crypto.randomBytes(6).toString("hex")
    const passwordHash = await bcrypt.hash(otp, config.BCRYPT_SALT);

    token = await new Token({
      userId: user._id,
      token: passwordHash,
      createdAt: Date.now()
    }).save()

    // Send Mail
    await new MailServ(user).sendEmailVerificationMail({ otp })

    return { token, otp }
  }

  /** 
   * Verify user email with valid OTP
   * @param {Object} data  Request Body
   * @returns {Object}
   */
  async verifyEmail(data) {
    const { email, otp } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")
    if (user.has_verified_email) throw new CustomError("Email is already verified")

    let VToken = await Token.findOne({ userId: user._id })
    if (!VToken) throw new CustomError("Invalid or expired OTP")

    const isValid = await bcrypt.compare(otp, VToken.token)
    if (!isValid) throw new CustomError("Invalid or expired OTP")

    await User.updateOne(
      { email },
      { $set: { has_verified_email: true } }
    )

    await Token.deleteOne({ email })

    return VToken
  }

  /** 
   * Sends a reset password OTP to user email
   * @param {Object} data  Request Body
   * @returns {Object}
   */
  async requestPasswordReset(data) {
    const { email } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")

    let token = await Token.findOne({ userId: user._id })
    if (token) await token.deleteOne()

    let otp = crypto.randomBytes(32).toString("hex")
    const hash = await bcrypt.hash(otp, config.BCRYPT_SALT);

    token = await new Token({
      userId: user._id,
      token: hash,
      created_at: Date.now()
    }).save()

    // Send Mail
    await new MailServ(user).sendPasswordResetMail({ otp })

    return { token, otp }
  }

  /** 
   * Reset user password
   * @param {Object} data  Request Body
   * @returns {Object}
   */
  async resetPassword(data) {
    const { email, otp, password } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")

    let RToken = await Token.findOne({ userId: user._id })
    if (!RToken) throw new CustomError("Invalid or expired password reset OTP")

    const isValid = await bcrypt.compare(otp, RToken.token)
    if (!isValid) throw new CustomError("Invalid or expired password reset OTP")

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT);

    await User.updateOne(
      { email },
      { $set: { password: passwordHash } }
    )

    await Token.deleteOne({ email })

    return RToken
  }

  /** 
   * Update user password 
   * @param {Object} data  Request Body
   * @returns {Object}
   */
  async updatePassword(data) {
    const { USER_ID, password } = data

    const user = await User.findOne({ _id: USER_ID });
    if (!user) throw new CustomError("User does not exist")

    // Check if user password is correct
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw new CustomError("Incorrect password");

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT)

    const updatedUser = await User.updateOne(
      { _id: USER_ID },
      { $set: { password: passwordHash } },
      { new: true }
    )

    return updatedUser
  }
}

module.exports = { AuthServ: new AuthService(), AuthService };