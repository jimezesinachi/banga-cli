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
    AuthService.requestEmailVerification(user)

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
   * @returns {null}
   */
   static async requestEmailVerification(data) {
    const { email } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")
    if (user.has_verified_email) throw new CustomError("Email is already verified")

    let token = await Token.findOne({ user_id: user._id })
    if (token) await token.deleteOne()

    let verifyToken = crypto.randomBytes(6).toString("hex")
    const passwordHash = await bcrypt.hash(verifyToken, config.BCRYPT_SALT);

    token = await new Token({
      userId: user._id,
      token: passwordHash,
      createdAt: Date.now()
    }).save()

    // Send Mail
    new MailServ(user).sendEmailVerificationMail({ verifyToken })

    return
  }

  /** 
   * Verify user email with valid OTP
   * @param {Object} data  Request Body
   * @returns {null}
   */
  async verifyEmail(data) {
    const { email, otp } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")
    if (user.has_verified_email) throw new CustomError("Email is already verified")

    let VToken = await Token.findOne({ email })
    if (!VToken) throw new CustomError("Invalid or expired OTP")

    const isValid = await bcrypt.compare(otp, VToken.token)
    if (!isValid) throw new CustomError("Invalid or expired OTP")

    await User.updateOne(
      { email },
      { $set: { has_verified_email: true } }
    )

    await VToken.deleteOne()

    return
  }

  /** 
   * Sends a reset password OTP to user email
   * @param {Object} data  Request Body
   * @returns {null}
   */
  async requestPasswordReset(data) {
    const { email } = data

    const user = await User.findOne({ email })
    if (!user) throw new CustomError("Email does not exist")

    let token = await Token.findOne({ user_id: user._id })
    if (token) await token.deleteOne()

    let resetToken = crypto.randomBytes(32).toString("hex")
    const hash = await bcrypt.hash(resetToken, config.BCRYPT_SALT);

    await new Token({
      userId: user._id,
      token: hash,
      created_at: Date.now()
    }).save()

    // Send Mail
    new MailServ(user).sendPasswordResetMail({ resetToken })

    return
  }

  /** 
   * Reset user password
   * @param {Object} data  Request Body
   * @returns {null}
   */
  async resetPassword(data) {
    const { email, resetToken, password } = data

    let RToken = await Token.findOne({ email })
    if (!RToken) throw new CustomError("Invalid or expired password reset OTP")

    const isValid = await bcrypt.compare(resetToken, RToken.token)
    if (!isValid) throw new CustomError("Invalid or expired password reset OTP")

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT);

    await User.updateOne(
      { email },
      { $set: { password: passwordHash } }
    )

    await RToken.deleteOne()

    return
  }

  /** 
   * Update user password 
   * @param {Object} data  Request Body
   * @returns {null}
   */
  async updatePassword(data) {
    const { USER_ID, password } = data

    const user = await User.findOne({ _id: USER_ID });
    if (!user) throw new CustomError("User dose not exist")

    //Check if user password is correct
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw new CustomError("Incorrect password");

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_SALT)

    await User.updateOne(
      { _id: USER_ID },
      { $set: { password: passwordHash } },
      { new: true }
    )

    return
  }
}

module.exports = { auth: new AuthService(), AuthService };