module.exports = (tokenData) => tokenData.exp * 1000 < Date.now();