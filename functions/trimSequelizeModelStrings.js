module.exports = (instance) => {

    const { dataValues } = instance;

    for (const key of Object.keys(dataValues)) {

        const value = dataValues[key];

        if (typeof value === 'string') {

            dataValues[key] = value.trim();
        }
    }
};