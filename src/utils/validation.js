const PASSWORD_MIN_LENGTH = 8;
// bcrypt only uses the first 72 bytes of the input, so anything longer would be silently truncated.
const PASSWORD_MAX_BYTES = 72;

// Validates the raw (un-hashed) password. Returns an error message, or null if the password is fine.
function getPasswordError(password) {
    if (typeof password !== 'string' || password.length === 0) {
        return 'Password is required.';
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }
    if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
        return `Password must be at most ${PASSWORD_MAX_BYTES} bytes long.`;
    }
    return null;
}

// Turns a single Mongoose validation/cast error into a readable sentence.
function readableFieldMessage(field, fieldError) {
    switch (fieldError.kind) {
        case 'required':
            return `${field} is required.`;
        case 'minlength':
            return `${field} must be at least ${fieldError.properties.minlength} characters long.`;
        case 'maxlength':
            return `${field} must be at most ${fieldError.properties.maxlength} characters long.`;
        case 'min':
            return `${field} must be at least ${fieldError.properties.min}.`;
        case 'max':
            return `${field} must be at most ${fieldError.properties.max}.`;
        case 'Number':
        case 'String':
            return `${field} has an invalid value.`;
        default:
            // Custom validators (email, gender) already throw readable messages.
            return fieldError.message;
    }
}

// Maps an error thrown by user.save() to { status, body }.
// ValidationError -> 400, duplicate key (unique index) -> 409, anything else -> 500.
function toSignupErrorResponse(err) {
    if (err.name === 'ValidationError') {
        const errors = {};
        for (const [field, fieldError] of Object.entries(err.errors)) {
            errors[field] = readableFieldMessage(field, fieldError);
        }
        return {
            status: 400,
            body: {message: Object.values(errors).join(' '), errors}
        };
    }
    if (err.code === 11000) {
        return {
            status: 409,
            body: {message: 'An account with this email already exists.', errors: {email: 'An account with this email already exists.'}}
        };
    }
    return {status: 500, body: {message: 'Error signing up user ...'}};
}

module.exports = {PASSWORD_MIN_LENGTH, getPasswordError, toSignupErrorResponse};
