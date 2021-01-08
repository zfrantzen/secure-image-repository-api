const response = require('../constants/response.constants.js');

module.exports = {

    // Returns a list of elements in the baseList but not in the
    // secondaryList
    listDifference : (baseList, secondaryList) => {
        result = [];

        if (secondaryList === undefined) {
            return baseList;
        }
        
        for (let i = 0; i < baseList.length; i++) {
            if (!secondaryList.includes(baseList[i])) {
                result.push(baseList[i]);
            }
        }

        return result;
    },

    handleError : (err, res) => {
        if (err.status !== undefined) {
            res.status(err.status).json(err);
        }
        else {
            res.status(response.GENERIC_SERVER_ERROR).json(err);
        }
    }
}