module.exports = reqQuery => Object.keys(reqQuery).reduce((options, key) => {

    const value = reqQuery[key];

    options[key] = +value;

    return options;

}, {});