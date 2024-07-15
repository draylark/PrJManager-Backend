import { Types } from "mongoose";
import { Project_i, User_i, Layer_i, Repository_i, ExtendedLayer_i, GuestLayer_i, gitlab_repo_i, 
    PopulatedTaskBase, TaskBase, Commit_i, PopulatedCommit3_i, PopulatedCommit5_i, ContributorsCommitsMap, CompletedTaskBase, ApprovalTaskBase, Collaborator_i, TasksData, EventBase } from "./interfaces/interfaces";
import { CombinedLayer_i, CombinedRepo_i, ContributorsUserData, Commit7Props, Commit6Props  } from "./types/types";

declare global {
    namespace Express {
      export interface Request {

        // * Project Middlewares

            project?: Project_i;
            owner?: User_i | boolean;
            type?:  'no-authorized' | 'authorized' | 'owner' | 'collaborator' | 'guest' | 'public' | 'private';  
            accessLevel?: string;  
            levels?: string[];
            user?: User_i;
            invMiddlewareState?: boolean;
            updatingMiddlewareState?: boolean;
            totalDeletedCollaborators?: number;
            deletingMiddlewareState?: boolean;
            projectLayers?: Layer_i[];
            projectRepos?: Repository_i[];
            projectsLength?: number;
            createdProjects?: Project_i[];


        // * Layer Middlewares

            layer?: Layer_i;
            creatingMiddlewareState?: boolean;
            totalCreatedCollaborators?: number;
            layers?: CombinedLayer_i[];
            createdLayers?: Layer_i[];


        // * Repository Middlewares
            gitlabRepo?: gitlab_repo_i;
            success?: boolean
            repoID?: Types.ObjectId;
            repo?: Repository_i;
            repos?: CombinedRepo_i[];
            createdRepos?: Repository_i[];


        // * Commit Middlewares

            hashes?: string[];
            contributorsData?: ContributorsUserData[];
            hash1?: string | null;
            hash2?: string | null;
            gitlabId?: number;
            task?: TaskBase | PopulatedTaskBase;
            commits?: Commit_i[] | PopulatedCommit3_i[] | PopulatedCommit5_i[] | Pick<Commit_i, 'uuid' | 'createdAt' | 'author'>[] | [];
            commit?: Commit_i ;
            commitsLength?: number;
            commitsData?: {
                commits1: Commit6Props[],
                commits2: Commit7Props[]
            };
            contributorsCommitsData?: ContributorsCommitsMap;


        // * Task Middlewares

            tasks?: TaskBase[];
            completedTasks: CompletedTaskBase[];
            approvalTasks: ApprovalTaskBase[];
            authorized?: User_i | Collaborator_i | boolean;
            completedTasksLength?: number;
            tasksData: TasksData;


        // * Collaborator Middlewares

            collaboratorsUpdated: boolean
            collaboratorsAdded: boolean


        // * Helpers Middlewares
            allEvents?: EventBase[];
            gitlabGroupID?: number  | null;
            repoGitlabID: number | null;


        // * Auth Middlewares
            authenticatedUser?: User_i;
            uid: string;
            userEmail: string;
            
      }
    }
  }