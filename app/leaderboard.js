//PlayersList = new Mongo.Collection('players');
export const PlayersList = new Mongo.Collection('players');


if(Meteor.isClient){
  Meteor.subscribe('thePlayers');
  Template.leaderboard.helpers({
    'player' : function() {
      let currentUserId = Meteor.userId();
      return PlayersList.find({createdBy: currentUserId},
          {sort: {score: -1, name: 1}});
    },
    'selectedClass': function(){
      let playerId = this._id;
      let selectedPlayer = Session.get('selectedPlayer');
      if(playerId == selectedPlayer) {
        return "selected";
      }
    },
    'selectedPlayer' : function(){
      let selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne({_id: selectedPlayer});
    }
  });

  Template.leaderboard.events({
    'click .player': function() {
      let playerId = this._id;
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function() {
      let selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('updateScore', selectedPlayer, 5);
    },
    'click .decrement' : function() {
      let selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('updateScore', selectedPlayer, -5);
    },
    'click .remove' : function() {
      let selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('removePlayer', selectedPlayer);
    }
  });

  Template.addPlayerForm.events({
    'submit form' : function(event){
      event.preventDefault();
      let playerNameVar = event.target.playerName.value;
      Meteor.call('createPlayer', playerNameVar);
      event.target.playerName.value="";
    }
  });
}

if(Meteor.isServer){
  Meteor.publish('thePlayers', function(){
    let currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});
  });
}

Meteor.methods({
  'createPlayer' : function(playerNameVar) {
    check(playerNameVar, String);
    let currentUserId = Meteor.userId();
    if(currentUserId) {
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      });
    }
  },
  'removePlayer' : function(selectedPlayer) {
    check(selectedPlayer, String);
    let currentUserId = Meteor.userId();
    if(currentUserId) {
      PlayersList.remove({ _id: selectedPlayer, createdBy: currentUserId });
    }
  },
  'updateScore' : function(selectedPlayer, scoreValue) {
    check(selectedPlayer, String);
    check(scoreValue, Number);
    let currentUserId = Meteor.userId();
    if(currentUserId) {
      PlayersList.update({_id: selectedPlayer, createdBy: currentUserId},
        {$inc: {score:scoreValue}});}
  }
});