alreadyFriends = function (userId) {
  var user = Meteor.user();

  return user &&
         user.profile &&
         user.profile.friends &&
         user.profile.friends.indexOf(userId) > -1;
}

getUsername = function (userId) {
  return Meteor.users.findOne(userId).username;
};
