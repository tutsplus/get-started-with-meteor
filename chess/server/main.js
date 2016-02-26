Meteor.publish('users', function () {
  return Meteor.users.find({}, { username: 1, profile: 1 });
});

Meteor.publish('games', function () {
  return Games.find({ $or: [{ b: this.userId }, { w: this.userId }]});
});

Meteor.publish('game', function (gameId) {
  return Games.find({ _id: gameId });
});

Meteor.publish('chat', function (gameId) {
  return Conversations.find({ game: gameId });
});
