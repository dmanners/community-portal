import * as _ from 'lodash';
import DatabaseConnection from './../DatabaseConnection';
import DatabaseAdapter from './../DatabaseAdapter';
import GithubService from '../../services/GithubService'

export const PROJECTS_TABLE = process.env.PROJECTS_TABLE;
export const PROJECTS_INDEX = process.env.PROJECTS_INDEX;
export const PROJECTS_GITHUB_ID_INDEX = process.env.PROJECTS_GITHUB_ID_INDEX;
export const PROJECTS_TO_INDEX_STARS_TABLE = process.env.PROJECTS_TO_INDEX_STARS_TABLE;
export const PROJECTS_STARS_TABLE = process.env.PROJECTS_STARS_TABLE;
export const PROJECTS_STARS_USER_ID_INDEX = process.env.PROJECTS_STARS_USER_ID_INDEX;
export const PROJECTS_CONTRIBUTORS_TABLE = process.env.PROJECTS_CONTRIBUTORS_TABLE;
export const PROJECTS_CONTRIBUTORS_USER_ID_INDEX = process.env.PROJECTS_CONTRIBUTORS_USER_ID_INDEX;

interface ProjectResourceInterface {
  create(data: any): Promise<any>;
  getProjects(data: any): Promise<any>;
  getById(data: any): Promise<any>;
  getGithubProjectUpvotes(organization:string, name:string): Promise<any>;
  edit(data: any): Promise<any>;
  updateStatus(data: any): Promise<any>;
  updateDisplay(data: any): Promise<any>;
  delete(data: any): Promise<any>;
}

export default class ProjectResource implements ProjectResourceInterface {
  private adapter: any;
  private api: any;
  private githubProjectsInformation: any;

  constructor(db: DatabaseConnection, Api?:any) {
    this.adapter = new DatabaseAdapter(db);
    this.api = Api ? new Api() : new GithubService();
    this.githubProjectsInformation = {};
  }

  create(data: any): Promise<any> {
    return this.adapter.create(PROJECTS_TABLE, data);
  }

  setProjectToIndexStars(project_name:string, project_id:string, project_organization:string): Promise<any> {
    return this.adapter.create(PROJECTS_TO_INDEX_STARS_TABLE, {project_name, project_id, project_organization});
  }

  setStarredProjects(collection:any[]): Promise<any> {
    return this.adapter.addItems({[PROJECTS_STARS_TABLE]: collection.map((item:any) => ({
      PutRequest: {
        Item: item
      }
    }))})
  }

  getProjectToIndexStars(): Promise<any> {
    return this.adapter.getAll(PROJECTS_TO_INDEX_STARS_TABLE);
  }

  getStarredUsers(org:string, repos:string, page:number):Promise<any> {
    return this.api.getStarredUsers(org, repos, page)
  }

  getProjectByGithubId(data: {github_project_id:string}): Promise<any> {
    return this.adapter.get(
      PROJECTS_TABLE,
      'github_project_id',
      data['github_project_id'],
      PROJECTS_GITHUB_ID_INDEX,
      false
    ).then((result:any) => result.Items[0])
  }

  getGithubProjectUpvotes(organization:string, name:string): Promise<any> {
    return this.api.getRepository(organization, name)
      .then((result:any) => {
        this.githubProjectsInformation[`${organization}:${name}`] = result.data;

        return {
          data: result.data['stargazers_count']
        };
      }
    );
  }

  upvoteProject(github_project_id:string, project_name:string, user_id:string, user_name:string) {
    return this.adapter.create(PROJECTS_STARS_TABLE, {
      project_id: github_project_id,
      project_name,
      user_id,
      user_name
    })
  }

  downvoteProject(github_project_id:string) {
    return this.adapter.delete(PROJECTS_STARS_TABLE, {
      project_id: github_project_id
    })
  }

  bookmarkProject(data: any): Promise<any> {
    const { user_id, project_id } = data;

    return this.adapter.addToMap(
      PROJECTS_TABLE,
      { project_id },
      'bookmarked',
      user_id,
      {user_id}
    );
  }

  unbookmarkProject(data:any): Promise<any> {
    const { user_id, project_id } = data;

    return this.adapter.removeFromMap(
      PROJECTS_TABLE,
      { project_id },
      'bookmarked',
      user_id
    );
  }

  joinProject(github_project_id:string, project_name:string, user_id:string, user_name:string, user_avatar_url:string) {
    return this.adapter.create(PROJECTS_CONTRIBUTORS_TABLE, {
      project_id: github_project_id,
      project_name,
      user_id,
      user_name,
      user_avatar_url
    })
  }

  unjoinProject(github_project_id:string) {
    return this.adapter.delete(PROJECTS_CONTRIBUTORS_TABLE, {
      project_id: github_project_id
    })
  }

  getGithubProjectId(organization:string, name:any): Promise<any> {
    if (this.githubProjectsInformation[`${organization}:${name}`]) {
      return new Promise((resolve:any) => {
        resolve({
          data: this.githubProjectsInformation[`${organization}:${name}`]['id'].toString()
        });
      });
    } else {
      return this.api.getRepository(organization, name)
        .then((result:any) => {
          this.githubProjectsInformation[`${organization}:${name}`] = result.data;

          return {
            data: result.data['id'].toString()
          };
        });
    }
  }

  getProjects(): Promise<any> {
    return this.adapter.get(
      PROJECTS_TABLE,
      'display',
      'true',
      PROJECTS_INDEX,
      false,
    );
  }

  getById(data: any): Promise<any> {
    const { project_id } = data;
    return this.adapter.getById(PROJECTS_TABLE, { project_id });
  }

  edit(data: any): Promise<any> {
    const { project_id, scopes } = data;
    delete data['project_id'];
    delete data['scopes'];

    return this.adapter.update(PROJECTS_TABLE, { project_id }, data);
  }

  updateStatus(data: any): Promise<any> {
    const { project_id, status, scopes } = data;

    delete data['scopes'];
    if (typeof scopes === 'undefined' || !_.includes(scopes, 'write:project')) {
      throw 'User does not have the required scope (write:project) to update project status';
    }

    return this.adapter.update(PROJECTS_TABLE, { project_id }, { status });
  }

  updateDisplay(data: any): Promise<any> {
    const { project_id, display } = data;
    return this.adapter.update(PROJECTS_TABLE, { project_id }, { display });
  }

  updateUpvoteCount(project_id:string, votes:number): Promise<any> {
    return this.adapter.update(PROJECTS_TABLE, {project_id}, {'upvotes': votes})
  }

  addContributor(data: any): Promise<any> {
    const { project_id, user_id, avatar_url, html_url } = data;

    return this.adapter.addToMap(
      PROJECTS_TABLE,
      { project_id },
      'contributors',
      user_id,
      { avatar_url, html_url },
    );
  }

  removeContributor(data:any): Promise<any> {
    const { project_id, user_id } = data;

    return this.adapter.removeFromMap(
      PROJECTS_TABLE,
      { project_id },
      'contributors',
      user_id,
    );
  }

  delete(data: any): Promise<any> {
    const { project_id } = data;
    return this.adapter.delete(PROJECTS_TABLE, { project_id });
  }
}
