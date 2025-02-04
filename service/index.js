const { subscribe } = require("moongose/routes");
const Contact = require("./schemas/Contact");
const User = require("./schemas/user");

const getAllContacts = async (owner,favorite) => {
  if(favorite===undefined){
    return Contact.find({owner:owner}).populate("owner","email");
  }
  return Contact.find({owner:owner,favorite}).populate("owner","email");
};
const getContactById = async (id,owner) => {
  return Contact.findOne({ _id: id , owner:owner});
};
const postNewContact = async (name, email, phone, favorite,owner) => {
  return Contact.create({ name, email, phone, favorite, owner });
};
const deleteContact = async (id,owner) => {
  return Contact.deleteOne({ _id: id ,owner:owner});
};
const updateContact = async (id, name, email, phone, favorite,owner) => {
  return Contact.updateOne(
    { _id: id,owner:owner },
    { name: name, email: email, phone: phone, favorite: favorite}
  );
};
const updateContactFavorite = async (id, favorite,owner) => {
  return Contact.updateOne({ _id: id, owner:owner }, { favorite: favorite });
};
const getAllFavorite = async (favorite) => {
  return Contact.find({ favorite: favorite });
};
const postNewUser = async (email, password,avatar,verificationToken) => {
  return User.create({ email, password, avatarUrl:avatar,verificationToken:verificationToken});
};
const getUserByEmail = async (email) => {
  return User.findOne({ email: email });
};
const updateUserById = async (id, token) => {
  return User.findByIdAndUpdate({ _id: id }, token);
};
const getUserById = async (id) => {
  return User.findOne({ _id: id });
};
const updateSubscription =async(id,subscription)=>{
  return User.updateOne({_id:id},{subscription:subscription})
}

const updateAwatars =async (id,avatar)=>{
  return User.updateOne({id:id},{avatarUrl:avatar})
}
const getUserByToken = async (verificationToken) => {
  return User.updateOne({ verificationToken: verificationToken },{verificationToken:null,verify:true});
};
module.exports = {
  getAllContacts,
  getContactById,
  postNewContact,
  deleteContact,
  updateContact,
  updateContactFavorite,
  getAllFavorite,
  postNewUser,
  getUserByEmail,
  updateUserById,
  getUserById,
  updateSubscription,
  updateAwatars,
  getUserByToken,
};
