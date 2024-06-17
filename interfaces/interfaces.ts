import { Types } from 'mongoose'; // Importa Types de Mongoose para ObjectId
import { Commit4Props } from '../types/types';

export interface Project_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  name: string;
  description: string;
  visibility?: 'public' | 'private'; // Opcional, ya que tiene un valor por defecto
  startDate?: Date; // Opcional, ya que tiene un valor por defecto
  endDate: Date;
  lastUpdated?: Date; // Opcional, ya que tiene un valor por defecto
  tags?: string[];
  collaborators?: number; // Opcional, ya que tiene un valor por defecto
  layers: number; // Opcional, ya que tiene un valor por defecto
  repositories?: number; // Opcional, ya que tiene un valor por defecto
  commits?: number; // Opcional, ya que tiene un valor por defecto
  completedTasks?: number; // Opcional, ya que tiene un valor por defecto
  tasks?: number; // Opcional, ya que tiene un valor por defecto
  readme?: Types.ObjectId | null;
  owner: Types.ObjectId;
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
};




// ! LAYER

export interface Layer_i {
  _id: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  name: string;
  path: string;
  description: string;
  visibility: 'open' | 'internal' | 'restricted';
  project?: Types.ObjectId; 
  repositories?: number; // Opcional, ya que tiene un valor por defecto
  gitlabId?: number;
  status?: boolean; // Opcional, ya que tiene un valor por defecto
  creator: Types.ObjectId;
  __v?: number; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
};

export interface ExtendedLayer_i extends Omit<Layer_i, 'gitlabId'> {
  accessLevel: "contributor" | "coordinator" | "manager" | "administrator";
};

export interface GuestLayer_i extends Omit<Layer_i, 'gitlabId'> {
  accessLevel: 'guest';
};



// ! REPOSITORY

export interface Repository_i {
  _id: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  name: string;
  description: string;
  visibility: 'open' | 'internal' | 'restricted';
  gitUrl: string;
  webUrl: string;
  branches: {
    name: string;
    default: boolean;
  }[];
  defaultBranch: string;
  projectID: Types.ObjectId | Project_i;
  layerID: Types.ObjectId | Layer_i;
  gitlabId: number;
  commits: number;
  creator: Types.ObjectId;
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
};

export interface PopulatedRepository_l extends  Omit<Repository_i, 'layerID'> {
  layerID: Layer_i;
};
export interface PopulatedRepositoryBase2 extends  Omit<Repository_i, 'layerID' | 'projectID'> {
  projectID: Project_i;  
  layerID: Layer_i;
};

export interface ExtendedRepository_i extends Omit<Repository_i, 'gitlabId' | 'webUrl' | 'gitUrl'> {
  accessLevel: string
}

export interface GuestRepository_i extends Omit<Repository_i, 'gitlabId' | 'webUrl' | 'gitUrl'> {
  accessLevel: 'guest';
}



// ! TASK

interface ReasonForRejection {
  uid: Types.ObjectId | User_i;
  text: string;
  date: Date;
  taskSubmissionDate?: Date | null;
};
interface PopulatedReasonForRejection {
  uid: Pick<User_i, '_id' | 'username' | 'photoUrl'>;
  text: string;
  date: Date;
  taskSubmissionDate?: Date | null;
};
interface ReadyContributor {
  uid: Types.ObjectId | User_i;
  date: Date;
  me: boolean;
};
interface PopulatedContributor {
  uid: Pick<User_i, '_id' | 'username' | 'photoUrl'>;
  date: Date;
  me: boolean;
};

export interface TaskBase {
  _id: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  type: 'open' | 'assigned';
  repository_number_task?: string | null;
  task_name: string;
  task_description: string;
  project: Types.ObjectId | Project_i;
  layer_related_id: Types.ObjectId | Layer_i;
  repository_related_id: Types.ObjectId | Repository_i;
  goals: string[];
  commits_hashes: string[];
  status: 'pending' | 'approval' | 'completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  conclusion_date?: Date;
  additional_info: {
    estimated_hours: number;
    actual_hours: number;
    notes: (string | null)[];
  };
  reasons_for_rejection: ReasonForRejection[];
  assigned_to: Types.ObjectId | null;
  contributorsIds: Types.ObjectId[];
  readyContributors: ReadyContributor[];
  reviewSubmissionDate?: Date | null;
  reviewSubmissionDates: Date[];
  deadline?: Date | null;
  completed_at?: Date | null;
  creator: Types.ObjectId;
  createdAt: Date; // Opcional, agregado por timestamps
  updatedAt: Date; // Opcional, agregado por timestamps
}


export interface PopulatedTaskBase extends Omit<TaskBase, 'project' | 'layer_related_id' | 'repository_related_id' | 'readyContributors' | 'reasons_for_rejection'> {
  project: Project_i;
  layer_related_id: Layer_i;
  repository_related_id: Repository_i;
  readyContributors: PopulatedContributor[];
  reasons_for_rejection: PopulatedReasonForRejection[];
}
export interface PopulatedTaskBaseRA extends Omit<TaskBase,  'repository_related_id' | 'assigned_to'> {
  assigned_to: User_i;
  repository_related_id: Repository_i;
};
export interface PopulatedTaskBaseR extends Omit<TaskBase,  'repository_related_id'> {
  repository_related_id: Repository_i;
};
export interface PopulatedTask2_i extends Omit<TaskBase, 'layer_related_id' | 'repository_related_id'> {
  layer_related_id: Layer_i;
  repository_related_id: Repository_i;
};
export interface PopulatedTask3 extends Omit<TaskBase, 'layer_related_id' | 'repository_related_id' | 'project'> {
  project: Project_i;
  layer_related_id: Layer_i;
  repository_related_id: Repository_i;
};



export interface PPCompletedOrApprovalTaskBase extends Omit<TaskBase, 'status' | 'layer_related_id' | 'repository_related_id'> {
  status: 'completed' | 'approval';
  layer_related_id: Layer_i;
  repository_related_id: Repository_i;
};
export interface PPCompletedTaskBase extends Omit<TaskBase, 'status' | 'layer_related_id' | 'repository_related_id'> {
  status: 'completed';
  layer_related_id: Layer_i;
  repository_related_id: Repository_i;
};
export interface CompletedOrApprovalTaskBase extends Omit<TaskBase, 'status'> {
  status: 'completed' | 'approval';
};
export interface CompletedTaskBase extends Omit<TaskBase, 'status'> {
  status: 'completed';
};
export interface ApprovalTaskBase extends Omit<TaskBase, 'status'> {
  status: 'approval';
};

export interface TaskSet5 extends Pick<TaskBase, 'completed_at' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id' | 'readyContributors'> {};

export interface TaskWithReadyContributors extends Omit<TaskSet5, 'readyContributors'> {
  readyContributorData?: ReadyContributor | {};
}


export interface PopulatedRepoTaskBase extends Omit<TaskBase, 'repository_related_id'> {
  repository_related_id: Pick<Repository_i, 'name'>;
}

export interface TasksData {
  taskSet0: Pick<PopulatedRepoTaskBase, 'createdAt' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id'>[]
  tasksSet1: Pick<PopulatedRepoTaskBase, 'reviewSubmissionDate' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id'>[];
  tasksSet2: Pick<PopulatedRepoTaskBase, 'completed_at' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id'>[];
  tasksSet3: Pick<PopulatedRepoTaskBase, 'reviewSubmissionDate' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id'>[];
  tasksSet4: Pick<PopulatedRepoTaskBase, 'completed_at' | 'task_name' | 'assigned_to' | '_id' | 'repository_related_id'>[];
  tasksSet5: TaskWithReadyContributors[]; 
}




// ! COMMIT

export interface Commit_i {
  _id: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  project: Types.ObjectId;
  layer: Types.ObjectId;
  repository: Types.ObjectId | Repository_i;
  branch: string;
  date: Date;
  author: {
    uid: Types.ObjectId;
    name: string;
    photoUrl?: string;
  };
  message: string;
  hash: string;
  uuid: string;
  associated_task: Types.ObjectId | TaskBase;
  createdAt: Date; // Opcional, agregado por timestamps
  updatedAt: Date; // Opcional, agregado por timestamps
};

export interface PopulatedCommit_i extends Omit<Commit_i, 'repository' | 'layer' | 'associated_task'> {
  repository: Repository_i;
  layer: Layer_i;
  associated_task: TaskBase;
};
export interface PopulatedCommit2_i extends Omit<Commit_i, 'repository'> {
  repository: Repository_i;
};
export interface PopulatedCommit3_i extends Omit<Commit_i, 'associated_task'> {
  associated_task: TaskBase | null;
};
export interface PopulatedCommit4_i extends Omit<Commit_i, 'associated_task' | 'repository'> {
  associated_task: TaskBase | null;
  repository: Repository_i;
};
export interface PopulatedCommit5_i extends Omit<Commit_i, 'associated_task' | 'repository' | 'project' | 'layer'> {
  associated_task: TaskBase | null;
  project: Project_i;
  layer: Layer_i;
  repository: Repository_i;
};

export interface ContributorCommit {
  id: Types.ObjectId;
  username: string;
  photoUrl: string;
  commits: number;
  lastCommit: Commit4Props | null
  firstCommit: Commit4Props | null
};
export interface ContributorsCommitsMap {
  [key: string]: ContributorCommit;
};






export interface Comment_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  content: string;
  project: Types.ObjectId;
  createdBy?: Types.ObjectId; 
  commentParent?: Types.ObjectId | null;
  answering_to?: Types.ObjectId | null;
  likes?: number; // Opcional, ya que tiene un valor por defecto
  replies?: number; // Opcional, ya que tiene un valor por defecto
  total_pages?: number; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
};

export interface Like_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  uid: Types.ObjectId;
  commentId: Types.ObjectId;
  isLike: boolean;
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
};



// ! COLLABORATOR

export interface Collaborator_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  project?: {
    _id: Types.ObjectId | Project_i;
    accessLevel: 'contributor' | 'coordinator' | 'manager' | 'administrator';
  };
  layer?: {
    _id: Types.ObjectId | Layer_i;
    accessLevel: 'contributor' | 'coordinator' | 'manager' | 'administrator';
  };
  repository?: {
    _id: Types.ObjectId | Repository_i;
    accessLevel: 'reader' | 'editor' | 'manager' | 'administrator';
    layer: Types.ObjectId;
  };
  projectID: Types.ObjectId;
  uid: Types.ObjectId;
  name?: string; // Opcional, ya que tiene un valor por defecto
  photoUrl?: string; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
};





export interface C_On_Project {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  project: {
    _id: Types.ObjectId | Repository_i;
    accessLevel: 'reader' | 'editor' | 'manager' | 'administrator';
    layer: Types.ObjectId;
  };
  projectID: Types.ObjectId;
  uid: Types.ObjectId;
  name?: string; // Opcional, ya que tiene un valor por defecto
  photoUrl?: string; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
};

export interface C_On_Layer {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  layer: {
    _id: Types.ObjectId | Repository_i;
    accessLevel: 'reader' | 'editor' | 'manager' | 'administrator';
    layer: Types.ObjectId;
  };
  projectID: Types.ObjectId;
  uid: Types.ObjectId;
  name?: string; // Opcional, ya que tiene un valor por defecto
  photoUrl?: string; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
};


export interface C_On_Repository {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  repository: {
    _id: Types.ObjectId | Repository_i;
    accessLevel: 'reader' | 'editor' | 'manager' | 'administrator';
    layer: Types.ObjectId;
  };
  projectID: Types.ObjectId;
  uid: Types.ObjectId;
  name?: string; // Opcional, ya que tiene un valor por defecto
  photoUrl?: string; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
};
export interface cOnRepoData_i {
    _id: Repository_i;
    accessLevel: 'reader' | 'editor' | 'manager' | 'administrator';
    layer: Types.ObjectId;
};








export interface Follower_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  uid: Types.ObjectId; 
  followerId: Types.ObjectId;
  active?: boolean; // Opcional, ya que tiene un valor por defecto
  mutualFollow?: boolean; // Opcional, ya que tiene un valor por defecto
  followedAt?: Date; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
}


export interface Friendship_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  ids: [Types.ObjectId, Types.ObjectId]; // Array de dos ObjectIds
  active?: boolean; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
}


export interface Noti_i {
  _id?: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  type: 
    | 'friend-request' 
    | 'project-invitation' 
    | 'task-invitation'
    | 'new-follower' 
    | 'new-commit' 
    | 'new-task-commit'
    | 'task-approved' 
    | 'task-assignation'
    | 'task-rejected' 
    | 'added-to-repo' 
    | 'added-to-layer';
  title: string;
  description?: string; // Opcional, ya que tiene un valor por defecto
  status?: boolean; // Opcional, ya que tiene un valor por defecto
  recipient: Types.ObjectId;
  from: {
    name: string;
    ID: Types.ObjectId;
    photoUrl?: string;
  };
  additionalData?: any; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
}

export interface User_i {
  _id: Types.ObjectId; // Opcional si Mongoose lo genera automáticamente
  username?: string;
  email?: string;
  password?: string;
  photoUrl?: string; // Opcional, ya que tiene un valor por defecto
  state?: boolean; // Opcional, ya que tiene un valor por defecto
  createdAt?: Date; // Opcional, agregado por timestamps
  updatedAt?: Date; // Opcional, agregado por timestamps
  google?: boolean;
  website?: string; // Opcional, ya que tiene un valor por defecto
  github?: string; // Opcional, ya que tiene un valor por defecto
  twitter?: string; // Opcional, ya que tiene un valor por defecto
  linkedin?: string; // Opcional, ya que tiene un valor por defecto
  projects?: number; // Opcional, ya que tiene un valor por defecto
  followers?: number; // Opcional, ya que tiene un valor por defecto
  following?: number; // Opcional, ya que tiene un valor por defecto
  friends?: number; // Opcional, ya que tiene un valor por defecto
  topProjects?: Types.ObjectId[]; // Opcional, ya que tiene un valor por defecto
  personalAccessToken?: string; // Opcional, ya que tiene un valor por defecto
}




export interface gitlab_repo_i {
  id: number;
  description: string | null;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  tag_list: string[];
  topics: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  readme_url: string | null;
  forks_count: number;
  avatar_url: string | null;
  star_count: number;
  last_activity_at: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number;
    avatar_url: string | null;
    web_url: string;
  },
  container_registry_image_prefix: string;
  _links: {
    self: string;
    issues: string;
    merge_requests: string;
    repo_branches: string;
    labels: string;
    events: string;
    members: string;
    cluster_agents: string;
  },
  packages_enabled: boolean;
  empty_repo: boolean;
  archived: boolean;
  visibility: string;
  resolve_outdated_diff_discussions: boolean;
  container_expiration_policy: {
    cadence: string;
    enabled: boolean;
    keep_n: number;
    older_than: string;
    name_regex: string;
    name_regex_keep: string | null;
    next_run_at: string;
  },
  repository_object_format: string;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  service_desk_enabled: boolean;
  service_desk_address: string;
  can_create_merge_request_in: boolean;
  issues_access_level: string;
  repository_access_level: string;
  merge_requests_access_level: string;
  forking_access_level: string;
  wiki_access_level: string;
  builds_access_level: string;
  snippets_access_level: string;
  pages_access_level: string;
  analytics_access_level: string;
  container_registry_access_level: string;
  security_and_compliance_access_level: string;
  releases_access_level: string;
  environments_access_level: string;
  feature_flags_access_level: string;
  infrastructure_access_level: string;
  monitor_access_level: string;
  model_experiments_access_level: string;
  model_registry_access_level: string;
  emails_disabled: boolean;
  emails_enabled: boolean;
  shared_runners_enabled: boolean;
  lfs_enabled: boolean;
  creator_id: number;
  import_url: string | null;
  import_type: string | null;
  import_status: string;
  import_error: string | null;
  open_issues_count: number;
  description_html: string;
  updated_at: string;
  ci_default_git_depth: number;
  ci_forward_deployment_enabled: boolean;
  ci_forward_deployment_rollback_allowed: boolean;
  ci_job_token_scope_enabled: boolean;
  ci_separated_caches: boolean;
  ci_allow_fork_pipelines_to_run_in_parent_project: boolean;
  build_git_strategy: string;
  keep_latest_artifact: boolean;
  restrict_user_defined_variables: boolean;
  ci_pipeline_variables_minimum_override_role: string;
  runners_token: string | null;
  runner_token_expiration_interval: string | null;
  group_runners_enabled: boolean;
  auto_cancel_pending_pipelines: string;
  build_timeout: number;
  auto_devops_enabled: boolean;
  auto_devops_deploy_strategy: string;
  ci_config_path: string;
  public_jobs: boolean;
  shared_with_groups: any[]; // Define mejor este tipo si es necesario
  only_allow_merge_if_pipeline_succeeds: boolean;
  allow_merge_on_skipped_pipeline: string | null;
  request_access_enabled: boolean;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  remove_source_branch_after_merge: boolean;
  printing_merge_request_link_enabled: boolean;
  merge_method: string;
  squash_option: string;
  enforce_auth_checks_on_uploads: boolean;
  suggestion_commit_message: string | null;
  merge_commit_template: string | null;
  squash_commit_template: string | null;
  issue_branch_template: string | null;
  warn_about_potentially_unwanted_characters: boolean;
  autoclose_referenced_issues: boolean;
  external_authorization_classification_label: string;
  requirements_enabled: boolean;
  requirements_access_level: string;
  security_and_compliance_enabled: boolean;
  compliance_frameworks: any[]; // Define mejor este tipo si es necesario
}


export interface EventBase {
  type: string;
  date: Date | null | undefined;
  data: any;
}