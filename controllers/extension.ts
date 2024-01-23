import { getSocket } from "../servers/SocketServer";
import { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {

    const { id } = req.body;
    const io = getSocket();

    console.log('vuenasss desde el server')
    io.emit( 'message', id );

    res.json({
        ok: true,
        msg: 'login'
    });
};