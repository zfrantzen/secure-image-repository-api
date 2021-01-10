const response = require('../constants/response.constants.js');

module.exports = {
    formatResponse : (message, detail, statusCode=response.GENERIC_SERVER_ERROR) => {
        return {
            msg: message,
            status: statusCode,
            detail: detail
        }
    }
}
