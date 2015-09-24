import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('business', function() {
    this.route('model');
  });
  this.route('search');
});

export default Router;
