interface Environment {
    apiURL: string;
    socketURL: string;
    production: boolean;
}

export const environment: Environment = {
    apiURL: '/ChattieChat/api/',
    socketURL: '/ChattieChat/socket.io',
    production: true,
}