var expect = require('chai').expect,
  path = require('path');

function scriptPath(script) {
  return path.join(__dirname, '..', 'bower_components', script);
}


describe('angular', function () {

  var angular, window;

  function load() {

    [
      '..',
      '../window',
      scriptPath('jquery/dist/jquery.js'),
      scriptPath('angular/angular.js'),
      scriptPath('angular-mocks/angular-mocks.js'),
      scriptPath('angular-sanitize/angular-sanitize.js'),
      scriptPath('jasmine-jquery/lib/jasmine-jquery.js')
    ].forEach(function (script) {
//        console.log(require.resolve(script));
        delete require.cache[require.resolve(script)];
    });
    angular = require('..');
    window = require('../window');
  }

  beforeEach(function () {
    process.env.TP_JQUERY_PATH = scriptPath('jquery/dist/jquery.js');
    process.env.TP_ANGULAR_PATH = scriptPath('angular/angular.js');
    process.env.TP_ANGULAR_MOCKS_PATH = scriptPath('angular-mocks/angular-mocks.js');
    process.env.TP_ANGULAR_SANITIZE_PATH = scriptPath('angular-sanitize/angular-sanitize.js');
    process.env.TP_JASMINE_JQUERY_PATH = scriptPath('jasmine-jquery/lib/jasmine-jquery.js');
  });

  describe('when global.jasmine is not defined', function () {

    beforeEach(load);

    it('angular should work', function () {
      angular.injector(['ng']).invoke(function ($rootScope, $compile) {
        var el = angular.element('<div>{{ 2 + 2 }}</div>');
        el = $compile(el)($rootScope);
        $rootScope.$digest();
        expect('' + el.html()).to.equal('4')
      });
    });

    it('angular should be able to sanitize html', function () {
      angular.injector(['ng', 'ngSanitize']).invoke(function ($sce) {
        expect($sce.getTrustedHtml('xxx<script>yyy</script>zzz')).to.equal('xxxzzz');
      });
    });

    it('window.angular should be angular', function () {
      expect(window.angular.version).to.be.an('object');
    });

    it('window.$ and window.jQuery should be jQuery', function () {
      expect(window.$).to.equal(window.jQuery);
      expect(window.$.fn.jquery).to.be.a('string');
    });

  });


  describe('when global.jasmine is defined', function () {

    var _beforeEach, _afterEach;

    beforeEach(function () {
      global.jasmine = {};
      // we must change the global beforeEach and afterEach because angular-mocks
      // calls them and this interferes we our mocha tests
      _beforeEach = beforeEach;
      _afterEach = afterEach;
      global.beforeEach = function() {};
      global.afterEach = function() {};
      load();
    });

    afterEach(function () {
      global.beforeEach = _beforeEach;
      global.afterEach = _afterEach;
      delete global.jasmine;
    });

    it('angular be able to mock module', function () {
      expect(angular.mock.module).to.be.a('Function');
    });

    it('window should have jasmine, beforeEach and afterEach', function () {
      expect(window.jasmine).to.equal(global.jasmine);
      expect(window.beforeEach).to.equal(global.beforeEach);
      expect(window.afterEach).to.equal(global.afterEach);
    });

    it('jasmine-jquery should have been loaded', function () {
      expect(window.jasmine.jQuery).to.be.an('Function');
    });

  });

});