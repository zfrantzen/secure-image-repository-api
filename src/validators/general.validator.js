const util = require('../utils/util.js');

function valueChecker(objectToCheck, fieldsToCheck, shouldBeInts) {
    valueError = [];
    
    // Check each value is defined and is int (if applicable)
    let index = 0;
    let objectKeys = Object.keys(objectToCheck);
    for (key in objectToCheck) {
        if (objectToCheck[key] === undefined && fieldsToCheck.includes(objectKeys[index])) {
            valueError.push('Value for parameter ' + objectKeys[index] + ' is undefined!');
        }
        else if (shouldBeInts && !Number.isInteger(parseInt(objectToCheck[key])) && fieldsToCheck.includes(objectKeys[index])) {
            valueError.push('Expected parameter ' + objectKeys[index] + ' to be an int!');
        }

        index++;
    }

    return valueError;
};

function diffChecker(expected, actual, fieldName) {
    diffError = [];

    // Check actual difference against expected
    let diff = util.listDifference(expected, actual);
    if (diff.length !== 0) {
        diffError.push('Missing expected parameters in ' + fieldName + ': ' + diff);
    }

    return diffError;
};

function pushError(error, result) {
    if (error.length !== 0) {
        result.isValid = false;
        result.messages.push(error);
    }
};

module.exports = {
    
    // Confirms that all required parameters are present and are valid ints
    // Possible input pairs in args include:
    //    - expectedHeaders (list) and actualHeaders 
    //    - expectedBody (list) and actualBody
    //    - expectedQuery (list) and actualQuery
    //    - imagePresent (boolean) and image
    validateRequest : (args, shouldBeInt=true) => {
        var result = {
            isValid: true,
            messages: []
        };

        // Check header parameters (if applicable)
        if (args.expectedHeaders !== undefined && args.actualHeaders !== undefined) {
            pushError(
                diffChecker(args.expectedHeaders, args.actualHeaders.length !== 0 ? Object.keys(args.actualHeaders) : [], 'header'),
                result
            );
            pushError(valueChecker(args.actualHeaders, args.expectedHeaders, shouldBeInt), result);
        }

        // Check body parameters (if applicable)
        if (args.expectedBody !== undefined && args.actualBody !== undefined) {
            pushError(
                diffChecker(args.expectedBody, args.actualBody.length !== 0 ? Object.keys(args.actualBody) : [], 'body'),
                result
            );
            pushError(valueChecker(args.actualBody, args.expectedBody, shouldBeInt), result);
        }

        // Check query parameters (if applicable)
        if (args.expectedQuery !== undefined && args.actualQuery !== undefined) {
            pushError(
                diffChecker(args.expectedQuery, args.actualQuery.length !== 0 ? Object.keys(args.actualQuery) : [], 'query'),
                result
            );
            pushError(valueChecker(args.actualQuery, args.expectedQuery, shouldBeInt), result);
        }

        // Check image (if applicable)
        if (args.imagePresent !== undefined && args.image === undefined) {
            pushError("Valid 'image' was expected as body paramter (via form-data), however, was not provided", result)
        }

        return result;
    },

    // Check if a user has permission to access a image
    hasImagePermission : (imageFile, requestingUserId) => {
        return (!imageFile.isPrivate || requestingUserId == imageFile.userId);
    }
};
