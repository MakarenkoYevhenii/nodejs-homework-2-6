const Joi = require("joi");
const service = require("../service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path  = require("path");
const fs=require("fs/promises")
const newUserValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(2).max(255).required().email(),
    password: Joi.string().min(2).max(20).required(),
  });

  return schema.validate(data);
};

const signup = async (req, res) => {
  const { error } = newUserValidation(req.body);
  const { email, password } = req.body;
  const hashPass = async (password) => {
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
  };

  if (!error) {
    try {
      const result = await service.postNewUser(
        email,
        await hashPass(password),
        gravatar.url(email)
      );

      return res.status(201).json({
        user: {
          email: result.email,
          subscription: result.subscription,
          avatar: gravatar.url(result.email),
        },
      });
    } catch (e) {
      return res.status(409).json({
        message: "Email in use",
      });
    }
  }
  res
    .status(400)
    .json({ message: "Ошибка от Joi или другой библиотеки валидации" });
};

const login = async (req, res, next) => {
  const { SECRET_KEY } = process.env;
  const { error } = newUserValidation(req.body);
  const { email, password } = req.body;
  if (!error) {
    try {
      const result = await service.getUserByEmail(email);
      if (await bcrypt.compare(password, result.password)) {
        const payload = {
          id: result._id,
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "10h" });
        const findAndUpdate = await service.updateUserById(result._id, {
          token,
        });
        return res.status(200).json({
          token: token,
          user: {
            email: findAndUpdate.email,
            subscription: findAndUpdate.subscription,
          },
        });
      }
      return res.status(401).json({
        message: "Email or password is wrong",
      });
    } catch (error) {
      return next(error);
    }
  }
  return res
    .status(400)
    .json({ message: "Ошибка от Joi или другой библиотеки валидации" });
};
const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await service.updateUserById(_id, { token: "" });
    return res.status(204).json();
  } catch (error) {
    next(error);
  }

  return res.status(401).json({});
};
const current = async (req, res, next) => {
  const { email, subscription } = req.user;
  try {
    return res.status(200).json({
      email: email,
      subscription: subscription,
    });
  } catch (error) {
    next(error);
  }
};
const updateSubscription = async (req, res, next) => {
  const { _id, email } = req.user;
  const subscription = req.body.subscription;
  const subscriptionType = ["starter", "pro", "business"];

  try {
    if (subscriptionType.includes(subscription)) {
      await service.updateSubscription(_id, subscription);
      return res.status(200).json({
        email: email,
        subscription: subscription,
      });
    }
    return res.status(400).json({
      message: "use only:starte,pro,buiness",
    });
  } catch (error) {
    next(error);
  }
};


const updateAwatars=async(req,res,next)=>{
  const avatarsDir = path.join(__dirname, "../", "public", "avatars");

  
  try {
    const {_id} = req.user;
    const {path: tempDir, filename} = req.file;
    const [extension] = filename.split(".").reverse();
    const name =`${_id}.${extension}`;
    const resultDir = path.join(avatarsDir, name);
    await fs.rename(tempDir, resultDir);
    
    const avatarURL = await path.join("avatars", name);
    console.log(avatarURL);
    await service.updateAwatars(_id, avatarURL);
    res.status(200).json({
      "avatarURL" : avatarURL,
  })
  } catch (error) {

  }
}

module.exports = {
  signup,
  login,
  logout,
  current,
  updateSubscription,
  updateAwatars,
};
