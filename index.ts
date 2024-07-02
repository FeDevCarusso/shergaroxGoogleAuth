import axios from 'axios';
import express, { NextFunction, Request, Response } from 'express'

class ShergaroxGoogleAuth implements ShergaroxGoogleAuthTypes {

    // propiedades

    clientId: string;
    clientSecret: string;
    redirectUri: string;


    //constructor
    constructor(clientId: string, clientSecret: string, redirectUri: string) {

        //client id 
        this.clientId = clientId;

        // client secret
        this.clientSecret = clientSecret;

        //uri de redireccion
        this.redirectUri = redirectUri;

    }


    initLogin(res: Response) {
        try {
            const authUrl = generateAuthUrl(this.clientId, this.redirectUri)
            return res.redirect(authUrl)
        } catch (error) {
            throw new Error("Se produjo un error en Shergarox Google Auth initLogin")
        }
    }

    async loginResponse(req: Request, res: Response) {
        try {
            const code = req.query.code;
            if (!code) {
                throw new Error("Se produjo un error en Shergarox Google Auth loginResponse")
            }

            const tokenParams = {
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code'
            }

            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', tokenParams);
            const { id_token, access_token } = tokenResponse.data;


            const idTokenResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`);
            const payload = idTokenResponse.data;

            const result = {
                access_token,
                ...payload
            }

            return result
        } catch (error) {
            throw new Error("Se produjo un error en Shergarox Google Auth loginResponse")

        }
    }
}

type ShergaroxGoogleAuthTypes = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}


// generate Auth url
const generateAuthUrl = (clientId: string, redirectUri: string) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&access_type=offline`;
    return authUrl;
}

function shergaroxGoogleAuth(clientId: string, clientSecret: string, redirectUri: string) {
    const SGA = new ShergaroxGoogleAuth(clientId, clientSecret, redirectUri)

    const googleLoginController = function (req: Request, res: Response, next: NextFunction) {
        try {
            return SGA.initLogin(res)
        } catch (error: any) {
            throw new Error(`Se produjo un error en googleLoginController ${error.messge}`)
        }

    }

    const googleLoginResultController = async function (req: Request, res: Response, next: NextFunction) {
        try {
            const code = req.query.code;

            // Intercambio de código de autorización por tokens de acceso e ID
            const tokenParams = {
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            };

            // Obtención de tokens de Google
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', tokenParams);
            const { id_token, access_token } = tokenResponse.data;

            // Verificación del ID token
            const idTokenResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`);
            const { sub: userId } = idTokenResponse.data; // ID del usuario

            const authResult = {
                error: false,
                data: {
                    userId,
                    access_token,
                    ...idTokenResponse.data,
                    sub: undefined
                }

            }

            return { authResult }

        } catch (error) {
            console.error("Se produjo un error en la autenticación con google", error)
            const authResult = {
                error: true,
                message: "Error en la autenticacion con Google"
            }

            return { authResult }
        }

    }

    return { googleLoginController, googleLoginResultController }
}

export default shergaroxGoogleAuth