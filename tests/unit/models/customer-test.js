import { moduleForModel, test } from 'ember-qunit';

moduleForModel('customer', 'Unit | Model | customer', {
  // Specify the other units that are required for this test.
  needs: ['model:company', 'model:system']
});

test('it exists', function(assert) {
  var model = this.subject();
  // var store = this.store();
  assert.ok(!!model);
});
