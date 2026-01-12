const ERROR_MESSAGES = {
    400: "Invalid request. Please check your information and try again.",
    401: "Your session has expired. Please log in again to continue.",
    403: "You do not have permission to perform this action.",
    404: "We couldn't find what you were looking for. It might have been moved or deleted.",
    408: "Request timed out. Please check your internet connection and try again.",
    422: "We couldn't process your request. Please check for any input errors.",
    429: "Too many requests. Please slow down and try again in a moment.",
    500: "Our servers are having a little trouble. Please try again later.",
    502: "Bad gateway. Please try again in a moment.",
    503: "The service is temporarily unavailable. Please try again later.",
    504: "Gateway timeout. Please check your internet connection.",
};

/**
 * Formats an error into a professional, user-friendly message.
 * @param {Error} error - The error object (usually from Axios).
 * @param {string} defaultMessage - A fallback message if no better one is found.
 * @returns {string} - The formatted error message.
 */
export const formatError = (error, defaultMessage = "Something went wrong. Please try again.") => {
    if (!error) return defaultMessage;

    // Handle network errors (no response from server)
    if (!error.response) {
        if (error.request) {
            return "Network error. Please check your internet connection.";
        }
        return error.message || defaultMessage;
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // Handle common technical validation strings from the server
    if (serverMessage && typeof serverMessage === 'string') {
        const technicalTerms = [
            'validation failed',
            'is not a valid enum value',
            'path `',
            'required field',
            'Cast to',
            'duplicate key error'
        ];

        if (technicalTerms.some(term => serverMessage.toLowerCase().includes(term.toLowerCase()))) {
            return "Please check your information. Some fields have invalid or missing data.";
        }
    }

    // Prioritize professional mapped messages for common status codes
    if (ERROR_MESSAGES[status]) {
        return ERROR_MESSAGES[status];
    }

    // Fallback to server-provided message if it's reasonably descriptive
    if (serverMessage && typeof serverMessage === 'string' && serverMessage.length > 0 && !/^\d+$/.test(serverMessage)) {
        return serverMessage;
    }

    return defaultMessage;
};

export default formatError;
