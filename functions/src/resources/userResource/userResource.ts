import * as _ from 'lodash';
import DatabaseConnection from './../DatabaseConnection';
import DatabaseAdapter from './../DatabaseAdapter';

const USERS_TABLE = process.env.USERS_TABLE;
const USERS_INDEX = process.env.USERS_INDEX;

interface UserResourceInterface {
  create(data: any): Promise<any>;
  getById(data: any): Promise<any>;
  update(data: any): Promise<any>;
  addUpvotedProject(data: any): Promise<any>;
  removeUpvotedProject(data: any): Promise<any>;
  getUpvotedProjects(data: any): Promise<any>;
  pledge(data: any): Promise<any>;
  delete(data: any): Promise<any>;
}

export default class UserResource implements UserResourceInterface {
  private adapter: any;

  constructor(db: DatabaseConnection) {
    this.adapter = new DatabaseAdapter(db);
  }

  create(data: any): Promise<any> {
    const { user_exists, user_id, access_token } = data;

    if (user_exists) {
      return this.adapter.update(USERS_TABLE, { user_id }, { access_token });
    }

    delete data['user_exists'];
    data.pledged_projects = {};

    return this.adapter.create(USERS_TABLE, data);
  }

  getById(data: any): Promise<any> {
    return this.adapter.getById(USERS_TABLE, data);
  }

  update(data: any): Promise<any> {
    const { user_id } = data;
    delete data['user_id'];

    return this.adapter.update(USERS_TABLE, { user_id }, data);
  }

  addUpvotedProject(data: any): Promise<any> {
    const { user_id, project_id } = data;
    return this.adapter.addToSetIfNotExists(USERS_TABLE, { user_id }, 'upvoted_projects', project_id);
  }

  removeUpvotedProject(data: any): Promise<any> {
    const { user_id, project_id } = data;
    return this.adapter.removeFromSetIfExists(USERS_TABLE, { user_id }, 'upvoted_projects', project_id);
  }

  getUpvotedProjects(data: any): Promise<any> {
    const { user_id } = data;
    return this.adapter.getById(USERS_TABLE, { user_id }, 'user_id, upvoted_projects');
  }

  pledge(data: any): Promise<any> {
    const { project_id, user_id, hours } = data;
    return this.adapter.incrementMapKey(USERS_TABLE, { user_id }, 'pledged_projects', project_id, hours);
  }

  subscribe(data: any): Promise<any> {
    const { user_id, project_id } = data;
    return this.adapter.addToSet(USERS_TABLE, { user_id }, 'subscribed_projects', project_id);
  }

  delete(data: any): Promise<any> {
    return this.adapter.delete(USERS_TABLE, data);
  }
}
