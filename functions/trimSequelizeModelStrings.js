module.exports = (instance) => {

    const { dataValues } = instance;

    Object.keys(dataValues).forEach((key) => {

        const value = dataValues[key];

        if (typeof value === 'string') {

            dataValues[key] = value.trim();
        }
    });
};

// TODO: move to models/utils