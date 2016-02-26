Template.users.onCreated(function () {
  this.subscribe('users');
});

Template.users.helpers({
  users: function () {
    return Meteor.users.find({ username: { $not: (Meteor.user() || {}).username } });
  }
});

Template.user.helpers({
  alreadyFriends: alreadyFriends
});

Template.user.events({
  'click .add': function (evt) {
    Meteor.call('setFriend', this._id);
  }
});
