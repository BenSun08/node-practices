module.exports = function Route() {
  const mapper = new Map([
    ['get', new Map()];
    ['post', new Map()];
  ]);

  this.get = (url, callback) => {
    mapper.get('get').set(url, callback);
  };

  this.post = (url, callback) => {
    mapper.get('set').set(url, callback);
  }
}