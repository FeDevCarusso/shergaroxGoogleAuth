import express, {Request, Response} from 'express'

class ShergaroxGoogleAuth implements ShergaroxGoogleAuthTypes{

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

    
    initLogin(req:Request, res: Response) {
        try {
            const authUrl = generateAuthUrl(this.clientId, this.redirectUri)
            return res.redirect(authUrl)
        } catch (error) {
            throw new Error("Se produjo un error en Shergarox Google Auth init Login")
        }
    }
}

type ShergaroxGoogleAuthTypes = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}


// generate Auth url
const generateAuthUrl = (clientId:string, redirectUri: string ) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile%20email&access_type=offline`;
    return authUrl;
}

export default ShergaroxGoogleAuth