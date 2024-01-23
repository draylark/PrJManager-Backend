import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';

const oauth2Client = async<T extends object>( req: Request, res: Response ): Promise<T> => {

    const oauth2ClientInstance = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
    const code = req.query.code as string;
  
    if (!code) {
       res.status(400).json({
        msg: 'No hay code query',
      });
      throw new Error('No code query parameter');
    }
  

    try {

        const { tokens } = await oauth2ClientInstance.getToken(code);
        oauth2ClientInstance.setCredentials(tokens);
    
        const ticket = await oauth2ClientInstance.verifyIdToken({

            idToken: tokens.id_token as string,
            audience: process.env.CLIENT_ID,

        });
  
        const userInfo = ticket.getPayload();
  
        if (!userInfo) {
            throw new Error('No user info found');
        }
    
        // res.redirect('http://localhost:5173/login');
        return userInfo as T;

    } catch (error) {
      if (error instanceof Error) {
        console.error('Controller Auth Error message:', error.message);
      }
  
      throw error;
    }
  };



export default oauth2Client