Template.games.onCreated(function () {
  this.subscribe('users');
  this.subscribe('games');
});

Template.games.helpers({
  possibleOpponents: function () {
    var user = Meteor.user();
    var friends = user.profile.friends || [];

    Games.find({ result: null }).forEach(function (game) {
      var color = (game.w === user._id) ? 'b': 'w';
      var idx   = friends.indexOf(game[color]);

      if (idx > -1) friends.splice(idx, 1);
    });

    return friends.length ? Meteor.users.find({ _id: { $in: friends } }) : null;
  },
  currentGames: function () {
    return Games.find({ result: null });
  },
  archivedGames: function () {
    return Games.find({ result: { $not: null } }).map(function (game) {
      if (game.result !== 'draw') game.result = getUsername(game.result) + ' won';
      return game;
    });
  },
  username: getUsername,
  byMe: function () {
    return this.needsConfirmation && this.needsConfirmation === Meteor.userId();
  },
  opponent: function () {
    return (this.w === Meteor.userId()) ? this.b : this.w;
  }
});

Template.games.events({
  'submit form': function (evt) {
    evt.preventDefault();
    Meteor.call('createGame', evt.target.color.value, evt.target.otherPlayer.value);
  },
  'click #accept': function (evt) {
    Meteor.call('acceptGame', this._id);
  },
  'click #decline': function (evt) {
    Meteor.call('declineGame', this._id);
  }
});
