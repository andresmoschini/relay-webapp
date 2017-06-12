'use strict';

describe('settingsService', () => {

  function createContext() {
    module('dopplerRelay');
    var context;
    inject((settings, $httpBackend) => {
      context = {
        settings: settings,
        $httpBackend: $httpBackend
      };
    });
    return context;
  }


  describe('getPlansAvailable', () => {
    it('should query backend', () => {
      var { settings, $httpBackend } = createContext();

      $httpBackend.expect(
        'GET',
        url => url.endsWith('/plans')
      ).respond(200, {
        a: null
      });

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.flush();

      expect(false).toBe(true);      
    });
  });
});
