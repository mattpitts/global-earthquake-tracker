module.exports = {
  'Card Creation Test' : function (browser) {
    browser
      .url('http://localhost:8080/index.html')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('.carousel-cards .card', 1000)
      .end();
  },
  'Globe Creation Test' : function (browser) {
	browser
	  .url('http://localhost:8080/index.html')
	  .waitForElementVisible('body', 1000)
	  .assert.elementPresent('#earth_div')
	  .waitForElementVisible('.we-pm-icon', 3000)
	  .end();
  },
  'Graph Creation Test' : function (browser) {
	browser
	  .url('http://localhost:8080/index.html')
	  .assert.elementPresent('.graph-left')
	  .assert.elementPresent('.graph-center')
	  .assert.elementPresent('.graph-right')
	  .end();
  },
  'Marker Creation Test' : function (browser) {
	browser
	  .url('http://localhost:8080/index.html')
	  .waitForElementVisible('.we-pm-icon', 3000)
	  .end();
  }

};
