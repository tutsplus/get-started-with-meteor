Template.game.onCreated(function () {
  this.autorun(() => {
    this.subscribe('users');  
    this.subscribe('game', FlowRouter.getParam('id'));
  });
});

Template.game.helpers({
  currentTurn: function () {
    var game = getGame();
    return getUsername(game[game.board.split(' ')[1]]);
  },
  result: function () {
    var result = getGame().result;

    if (!result) return null;
    if (result === 'draw') return 'Draw!';
    
    return getUsername(result) + ' won!';
  },
  moves: function () {
    return pair(getMoves()).map(function (arr) {
      return arr[0] + ' ' + (arr[1] || '');
    });
  },
  rows: function () {
    var chess = new Chess();
    getMoves().forEach(chess.move.bind(chess));
    return makeRows(chess.fen(), getGame().b);
  }
});

function pair (arr) {
  var i = 0;
  var ret = [];

  while(i < arr.length) ret.push([arr[i++], arr[i++]]);
  return ret;
}

var selectedData = null;
var selectedNode = null;

Template.game.events({
  'click td': function (evt) {
    var data = getGame();

    if (data[data.board.split(' ')[1]] !== Meteor.userId()) return;

    var chess = new Chess(data.board);

    if (selectedData) {
      if (selectedData.cell === this.cell) {
        deselect(); 
      } else {
        var move = canMove(selectedData.cell, this.cell);

        if (move) {
          Meteor.call('makeMove', data._id, move);
          deselect();
        }
      }
    } else {
      if (canMove(this.cell)) select(evt.target, this);
    }

    function canMove(from, to) {
      var moves = chess.moves({ square: from });

      return !to ? moves.length > 0 : moves.reduce(function (prev, curr) {
        if (prev) return prev;
        return curr.indexOf(to) > -1 ? curr : false;
      }, false);
    }

    // --- no,
    // ---- can the piece on first cell move to the cell?
    // ----- yes, make move
    // ----- no, ignore
  }
});

function select(node, data) {
  selectedNode = node;
  selectedData = data;
  selectedNode.classList.add('selected');
}

function deselect() {
  selectedNode.classList.remove('selected');
  selectedNode = null;
  selectedData = null;
}


function makeRows(board, b) {
  var rows = board.split(' ')[0].split('/');

  var data = rows.map(function (row, i) {
    var rank = 8 - i; // row number
    var file = 0; // column

    return [].concat.apply([], row.split('').map(function (cell) {
      var n = parseInt(cell);

      if (isNaN(n)) return makeCell(cell, rank, file++);

      return Array.apply(null, Array(n)).map(function (cell) {
        return makeCell(cell, rank, file++);
      });
    }));
  });

  if (b === Meteor.userId()) {
    data.reverse();
    data = data.map(function (row) {
      return row.reverse();
    });
  }

  return data;
}

function makeCell(val, rank, file) {
  return {
    piece: val,
    img: pieces[val] || '',
    cell: String.fromCharCode(97 + file) + rank
  };
}

function getGame() {
  return Games.findOne(FlowRouter.getParam('id'));
}

function getMoves() {
  var chess = new Chess();
  chess.load_pgn(getGame().moves);
  var moves = chess.history();

  if (Session.get('stepping')) {

    if (moves.length < Session.get('moveIndex')) {
      Session.set('moveIndex', moves.length);
    }

    moves = moves.slice(0, Session.get('moveIndex'));
  }

  return moves;
}

Template.stepper.helpers({
  canStep: function (result) {
    return result && !Session.get('stepping');
  },
  stepping: function () {
    return Session.get('stepping');
  }
});

Template.stepper.events({
  'click #step': function (evt) {
    Session.set('stepping', true);
    Session.set('moveIndex', 0);
  },
  'click #prev': function (evt) {
    var idx = Session.get('moveIndex');
    Session.set('moveIndex', idx <= 0 ? 0 : idx - 1);
  },
  'click #next': function (evt) {
    Session.set('moveIndex', Session.get('moveIndex') + 1);
  }
});





