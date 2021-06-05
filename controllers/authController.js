const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');
const Email = require('./../utils/email');
const factory = require('./handlerFactory');
const ErrorMessage = require('./../utils/error');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(
    user._id
  );

  // Armazenar token no cookie, fazendo com que o mesmo seja utilizado em todas requisições,
  // e definindo-o como httpOnly, fazendo com que o token se torne inalterado

  const cookieOption = {
    expires: new Date(
      Date.now() +
      process.env
        .JWT_COOKIE_EXPIRES_IN *
      3600 *
      1000
    ),
    httpOnly: true
  };

  // if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie(
    'jwt',
    token,
    cookieOption
  );

  // Remove the password from the output
  user.password = undefined;

  res
    .status(statusCode)
    .json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};

exports.siginup = catchAsync(async (req, res, next) => {
  if (req.body.role * 1 === 0)
    //Não é permitido cadastrar-se como admin
    return next(new AppError(ErrorMessage.ERROR000, 500));

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role, //perfilCode
    telemovel: req.body.telemovel,
    endereco: req.body.endereco
  });

  // 3) Send it to user's email
  const url = `${req.protocol}://${req.get('host')}/api/v1/users/${newUser._id
    }`;

  await new Email(newUser, url).sendWelcome();
  factory.createLogs(newUser._id, User, null, newUser, req.method);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, telemovel } = req.body;

  if (!password) {
    return next(new AppError(ErrorMessage.ERROR002, 400));
  }

  let user = null;
  if (email) user = await User.findOne({ email }).select('+password');
  else if (telemovel)
    user = await User.findOne({ telemovel }).select('+password');
  else return next(new AppError(ErrorMessage.ERROR003, 400));

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError(ErrorMessage.ERROR004, 400));

  if (user.isBloqued)
    return next(new AppError(ErrorMessage.ERROR025, 401));

  factory.createLogs(user._id, User, user, null, 'Login');
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  const cookieOption = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  };

  res.cookie('jwt', 'loggedout', cookieOption);
  const token = 'loggedout';
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError(ErrorMessage.ERROR005, 401));
  }

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(ErrorMessage.ERROR006, 401));
  }

  // 4) Check if user changed password after the token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(ErrorMessage.ERROR007, 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLogged = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError(ErrorMessage.ERROR026), 401);
  }

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(ErrorMessage.ERROR026), 401);
  }

  // 4) Check if user changed password after the token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(ErrorMessage.ERROR026), 401);
  }

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: currentUser
    }
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role.perfilCode)) {
      return next(new AppError(ErrorMessage.ERROR008, 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POST email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(ErrorMessage.ERROR009, 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(ErrorMessage.ERROR001), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() }
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError(ErrorMessage.ERROR010, 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user => There is one document middleware to perform this operation

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User from Collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError(ErrorMessage.ERROR011, 401));
  }

  // 3) If SourceBuffer, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
