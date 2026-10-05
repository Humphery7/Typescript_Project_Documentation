

class AppError extends Error {
    statusCode: number;
    message: string;

    constructor(message: string, code: number) {
        super(message);

        this.statusCode = code;
        this.name = "AppError";
        this.message = message
    }

}

export default AppError

