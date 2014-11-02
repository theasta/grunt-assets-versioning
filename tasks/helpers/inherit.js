/** @module helpers/inherit */

var _ = require("lodash");

module.exports = function (Parent, protoObj) {
  "use strict";
  var Child = function () {
    return Parent.apply(this, arguments);
  };
  var F = function(){};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;

  if (protoObj) {
    _.extend(Child.prototype, protoObj);
  }

  return Child;
};
