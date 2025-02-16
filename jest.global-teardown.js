module.exports = async function globalTeardown() {
  if (global.__MONGOINSTANCE) {
    await global.__MONGOINSTANCE.stop();
    console.log('🛑 [Global Teardown] MongoDB Memory Server stopped');
  }
};
