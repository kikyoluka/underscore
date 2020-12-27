import identity from './identity.js';
import cb from './_cb.js';
import find from './find.js';

// The general algorithm behind `_.min` and `_.max`. `compare` should return
// `true` if its first argument is more extreme than (i.e., should be preferred
// over) its second argument, `false` otherwise. `iteratee` and `context`, like
// in other collection functions, let you map the actual values in `collection`
// to the values to `compare`. `decide` is an optional customization point
// which is only present for historical reasons; please don't use it, as it will
// likely be removed in the future.
export default function extremum(collection, compare, iteratee, context, decide) {
  decide || (decide = identity);
  // Detect use of a partially-applied `extremum` as an iteratee.
  if (typeof iteratee == 'number' && typeof collection[0] != 'object') {
    iteratee = null;
  }
  iteratee = cb(iteratee, context);
  // `extremum` is essentially a combined map+reduce with **two** accumulators:
  // `result` and `iterResult`, respectively the unmapped and the mapped version
  // corresponding to the same element.
  var result, iterResult;
  function processRemainder(value, key) {
    var iterValue = iteratee(value, key, collection);
    if (compare(iterValue, iterResult)) {
      result = value;
      iterResult = iterValue;
    }
  }
  var process = function(value, key) {
    process = processRemainder;
    result = value;
    iterResult = iteratee(value, key, collection);
  }
  find(collection, function(value, key) { process(value, key); });
  // `extremum` normally returns an unmapped element from `collection`. However,
  // `_.min` and `_.max` forcibly return a number even if there is no element
  // that maps to a numeric value. Passing both accumulators through `decide`
  // before returning enables this behavior.
  return decide(result, iterResult);
}