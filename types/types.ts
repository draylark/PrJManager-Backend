import { ExtendedLayer_i, GuestLayer_i, ExtendedRepository_i, GuestRepository_i, User_i, PopulatedCommit4_i, PopulatedCommit2_i, Commit_i  } from "../interfaces/interfaces";

export type CombinedLayer_i = ExtendedLayer_i | GuestLayer_i;


export type CombinedRepo_i = ExtendedRepository_i | GuestRepository_i;


export type ContributorsUserData = Pick<User_i, 'username' | 'photoUrl' | '_id'>

export type Commit7Props = Pick<PopulatedCommit4_i, '_id' | 'createdAt' | 'uuid' | 'author' | 'branch' | 'repository' | 'associated_task'>
export type Commit6Props = Pick<PopulatedCommit2_i, '_id' | 'createdAt' | 'uuid' | 'author' | 'branch' | 'repository'>
export type Commit4Props = Pick<Commit_i,  'createdAt' | 'uuid' | 'author' | 'associated_task'>