// controllers/eventController.ts

import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import Event from '../models/eventSchema';
import User from '../models/userSchema';

interface IEventData {
    _id: ObjectId;
    __v: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    // ...otros campos
}

interface IUser {
    events: IEventData[];
    // ...otros campos
}

interface ITransformedEventData extends Omit<IEventData, '_id' | '__v'> {
    eid: ObjectId;
}

export const postEvent = async (req: Request, res: Response) => {  
    console.log(req.uid)
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();

        const updatedUser = await User.findByIdAndUpdate(
            req.uid,
            { $push: { events: newEvent._id } },
            { new: true }
        );

        return res.json({
            msg: 'Event created',
            updatedUser,
            newEvent
        });
    } catch (error) {
        return res.status(400).json({
            msg: 'Internal Server Error',
            error
        });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            msg: 'User ID is required'
        });
    }

    const user = await User.findById(userId).populate('events').select('events');

    if (!user) {
        return res.status(400).json({
            msg: 'User not found'
        });
    }

    const events = user.toObject();
    events.events = events.events.map((event) => {
        const { __v, _id, ...eventData } = event;
        return { ...eventData, eid: _id };
    });

    res.json({
        events
    });
};