import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('business', function() {
    this.route('model', function() {
      this.route('results');
    });
  });
  this.route('search');
  this.route('loading');
});

export default Router;
