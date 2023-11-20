const { LambdaClient, GetAccountSettingsCommand } = require('@aws-sdk/client-lambda');
const { getReadings, getCopticDate, getReadingsWithText } = require('coptic-io')
// Create client outside of handler to reuse
const lambda = new LambdaClient();

// Handler for /readings
exports.readingsHandler = async (event, context) => {
	// Check if the query parameter isDetailed is true
	const isDetailed = event.queryStringParameters && event.queryStringParameters.isDetailed === 'true';

	try {
			let readings;
			if (isDetailed) {
					readings = getReadingsWithText();
			} else {
					readings = getReadings();
			}

			return formatResponse(serialize(readings));
	} catch (error) {
			return formatError(error);
	}
};

// Handler for /calendar
exports.calendarHandler = async (event, context) => {
    try {
        const calendarData = getCopticDate()
        return formatResponse(serialize(calendarData));
    } catch (error) {
        return formatError(error);
    }
};

var formatResponse = function (body) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        isBase64Encoded: false,
        multiValueHeaders: {
            'X-Custom-Header': ['My value', 'My other value'],
        },
        body: body,
    };
};

var formatError = function (error) {
    return {
        statusCode: error.statusCode,
        headers: {
            'Content-Type': 'text/plain',
            'x-amzn-ErrorType': error.code,
        },
        isBase64Encoded: false,
        body: error.code + ': ' + error.message,
    };
};

// Use SDK client
var getAccountSettings = function () {
    return lambda.getAccountSettings().promise();
};

var serialize = function (object) {
    return JSON.stringify(object, null, 2);
};
