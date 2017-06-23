describe('Billing Page', () => {
  var BillingPage = require('./page-objects/billing-page').BillingPage;

  afterEach(() => {
    browser.removeMockModule('descartableModule');
    browser.removeMockModule('descartableModule2');
  });

  function beginAuthenticatedSession() {
    browser.addMockModule('descartableModule', () => angular
      .module('descartableModule', [])
      .run((jwtHelper, auth) => {
        var permanentToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0ODQ2MzAzMTgsImV4cCI6MTQ4NzIyMjMxOCwiaWF0IjoxNDg0NjMwMzE4LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjM0NzUxIiwic3ViIjoxMDAzLCJ1bmlxdWVfbmFtZSI6ImFtb3NjaGluaUBtYWtpbmdzZW5zZS5jb20iLCJyZWxheV9hY2NvdW50cyI6WyJhbW9zY2hpbmktbWFraW5nc2Vuc2UiXSwicmVsYXlfdG9rZW5fdmVyc2lvbiI6IjEuMC4wLWJldGE1In0.dQh20ukVSCP0rNXMWBh2DlPQXbP0uTaYzadRDNPXECI9lvCsgDKNXc2bToXAUQDeXw90kbHliVF-kCueW4gQLPBtMJOcHQFv6LfgspsG2jue2iMwoBC1q6UB_4xFlGoyhkRjldnQUV0oqBTzhFdXuTvQz53kRPiqILCHkd4FLl4KliBgdaDRwWz-HIjJwinMpnv_7V38CNvHlHo-q2XU0MnE3CsGXmWGoAgzN7rbeQPgI9azHXpbaUPh9n_4zjCydOSBC5tx7MtEAx3ivfFYImBPp2T2vUM-F5AwRh7hl_lMUvyQLal0S_spoT0XMGy8YhnjxXLoZeVRisWbxBmucQ';
        auth.saveToken(permanentToken);
      }));
  }

  function setupSamplePlansResponse() {

    browser.addMockModule('descartableModule2', () => angular
      // This code will be executed in the browser context,
      // so it cannot access variables from outside its scope
      .module('descartableModule2', ['ngMockE2E'])
      .run($httpBackend => {
        $httpBackend.whenGET(/\/plans/).respond(200, {
          "items": [
            { "currency": "USD",
              "fee": 5.90,
              "name": "PLAN-10K"},
            { "currency": "USD",
              "fee": 31.8,
              "name": "PLAN-60K" }
          ]
        });
       $httpBackend.whenGET(/\/resources\/countries\.json/).respond(200, [{"code": "BV","en": "Bolivia, Plurinational State Of","es": "Bolivia"}]); 
      }));
  }

  it('should show the selected plan name and price', () => {
    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();

    // Act
    var plan = billingPage.getPlanName();
    var price = billingPage.getPrice();

    // Assert
    expect(plan).toBe('PLAN-60K');
    expect(billingPage.getPrice()).toBe('USD 31.80 x month');
  });

  it('should show credit card icon when complete visa credit card number', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();

    // Act
    billingPage.setCreditCardNumber(4);

    // Assert
    expect(billingPage.isCcIconVisaDisplayed()).toBeTruthy();
    expect(billingPage.isCcIconAmexDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconMastercardDisplayed()).toBeFalsy();

  });

  it('should show credit card icon when complete master credit card number', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();

    // Act
    billingPage.setCreditCardNumber(54);

    // Assert
    expect(billingPage.isCcIconMastercardDisplayed()).toBeTruthy();
    expect(billingPage.isCcIconVisaDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconAmexDisplayed()).toBeFalsy();

  });

  it('should show credit card icon when complete amex credit card number', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();

    // Act
    billingPage.setCreditCardNumber(34);

    // Assert
    expect(billingPage.isCcIconAmexDisplayed()).toBeTruthy();
    expect(billingPage.isCcIconVisaDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconMastercardDisplayed()).toBeFalsy();

  });

  it('should not show credit card icons when complete with credit card number invalid', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();

    // Act
    billingPage.setCreditCardNumber(988923432432);

    // Assert
    expect(billingPage.isCcIconAmexDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconVisaDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconMastercardDisplayed()).toBeFalsy();

  });

  it('should not show credit card icons by default', () => {

    // Arrange
    beginAuthenticatedSession();
    setupSamplePlansResponse();

    // Act
    browser.get('/#/settings/billing?plan=PLAN-60K');
      
    // Assert
    var billingPage = new BillingPage();
    expect(billingPage.isCcIconAmexDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconVisaDisplayed()).toBeFalsy();
    expect(billingPage.isCcIconMastercardDisplayed()).toBeFalsy();

  });

  it('should show countries drop downs in different languages', () => {

    // Arrange
    var countryInEnglish = "Bolivia, Plurinational State Of";
    var countryInSpanish = "Bolivia";
    beginAuthenticatedSession();
    setupSamplePlansResponse();
    
    // Act
    browser.get('/#/settings/billing?plan=PLAN-60K&lang=es');

    // Assert
    var billingPage = new BillingPage();
    expect(billingPage.getFirstCountryName()).toBe(countryInSpanish);

     // Act
    browser.get('/#/settings/billing?plan=PLAN-60K&lang=en');
    
    // Assert
    expect(billingPage.getFirstCountryName()).toBe(countryInEnglish);

  });

  it('should show the confirmation page with all the fields filled', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();
    var name = 'TestName TestLastName';
    var company = 'Company Test';
    var address = 'Address 123';
    var city = 'CityTest';
    var zCode = '1234';
    var country = 'Bolivia, Plurinational State Of';
    var cardHolder = 'TestName TestLastName';
    var creditCardNumber = '4444444444444444';
    var expDate = '0919';
    var secCode = '123'

    // Act
    billingPage.setName(name);
    billingPage.setCompany(company);
    billingPage.setAddress(address);
    billingPage.setCity(city);
    billingPage.setZCode(zCode);
    billingPage.setCountry(country);
    billingPage.setCardHolder(cardHolder);
    billingPage.setCreditCardNumber(creditCardNumber);
    billingPage.setExpDate(expDate);
    billingPage.setSecCode(secCode);

    billingPage.clickCheckOrder();

    // Assert
    expect(billingPage.isConfirmationDisplayed()).toBeTruthy();
    expect(billingPage.isNameDisplayed()).toBe(name);
    expect(billingPage.isCompanyDisplayed()).toBe(company);
    expect(billingPage.isCityDisplayed()).toBe(city);
    expect(billingPage.isZCodeDisplayed()).toBe(zCode);
    expect(billingPage.isCountryDisplayed()).toContain(country);
    expect(billingPage.isCardHolderDisplayed()).toBe(cardHolder);
    expect(billingPage.isCcNumberDisplayed()).toBe('************4444');
    expect(billingPage.isExpDateDisplayed()).toBe('09/19');
    expect(billingPage.isSecCodeDisplayed()).toBe('***');
    expect(billingPage.isBillingPageDisplayed()).toBeFalsy();

  });

  it('should not show the confirmation page if all fields are not filled', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();
    var name = '';
    var company = 'Company Test';
    var address = 'Address 123';
    var city = 'CityTest';
    var zCode = '1234';
    var country = 'Bolivia, Plurinational State Of';
    var cardHolder = 'TestName TestLastName';
    var creditCardNumber = '4444444444444444';
    var expDate = '0919';
    var secCode = '123'

    // Act
    billingPage.setName(name);
    billingPage.setCompany(company);
    billingPage.setAddress(address);
    billingPage.setCity(city);
    billingPage.setZCode(zCode);
    billingPage.setCountry(country);
    billingPage.setCardHolder(cardHolder);
    billingPage.setCreditCardNumber(creditCardNumber);
    billingPage.setExpDate(expDate);
    billingPage.setSecCode(secCode);

    billingPage.clickCheckOrder();

    // Assert
    expect(billingPage.isConfirmationDisplayed()).toBeFalsy();
    expect(billingPage.isBillingPageDisplayed()).toBeTruthy();
  });
  it('should go back to billing page if the user clicks on modify information', () => {

    // Arrange
    beginAuthenticatedSession();
    browser.get('/#/settings/billing?plan=PLAN-60K');
    setupSamplePlansResponse();

    var billingPage = new BillingPage();
    var name = 'TestName TestLastName';
    var company = 'Company Test';
    var address = 'Address 123';
    var city = 'CityTest';
    var zCode = '1234';
    var country = 'Bolivia, Plurinational State Of';
    var cardHolder = 'TestName TestLastName';
    var creditCardNumber = '4444444444444444';
    var expDate = '0919';
    var secCode = '123'

    billingPage.setName(name);
    billingPage.setCompany(company);
    billingPage.setAddress(address);
    billingPage.setCity(city);
    billingPage.setZCode(zCode);
    billingPage.setCountry(country);
    billingPage.setCardHolder(cardHolder);
    billingPage.setCreditCardNumber(creditCardNumber);
    billingPage.setExpDate(expDate);
    billingPage.setSecCode(secCode);
    billingPage.clickCheckOrder();

    expect(billingPage.isConfirmationDisplayed()).toBeTruthy();
    expect(billingPage.isBillingPageDisplayed()).toBeFalsy();

    // Act
    billingPage.clickModifyInformation();

    // Assert
    expect(billingPage.isConfirmationDisplayed()).toBeFalsy();
    expect(billingPage.isBillingPageDisplayed()).toBeTruthy();
  });


});