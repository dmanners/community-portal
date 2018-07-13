import AuthorizationService from './../../services/AuthorizationService';

const authroizationService = new AuthorizationService();

interface UserControllerInterface {
  create(data: any): (result: any) => any;
  getById(data: any): (result: any) => any;
  update(data: any): (result: any) => any;
  getUpvotedProjects(data: any): (result: any) => any;
  getBookmarkedProjects(data: any): (result: any) => any;
  delete(data: any): (result: any) => any;
  addUpvotedProject(data: any): (result: any) => any;
  addBookmarkedProject(data: any): (result: any) => any;
  removeUpvotedProject(data: any): (result: any) => any;
  pledge(data: any): (result: any) => any;
  subscribe(data: any): (result: any) => any;
  checkExistence(data: any): (result: any) => any;
  storeAvatarUrl(data: any): (result: any) => any;
  getScopes(data: any): (result: any) => any;
}

export default class UserController implements UserControllerInterface {
  create(data: any) {
    delete data['user_exists'];
    delete data['access_token'];

    const { user_id, scopes } = data;
    return (result: any) => {
      return {
        status: 200,
        payload: {
          user_id,
          scopes,
          message: 'User saved',
          token: authroizationService.create(data),
        },
      };
    };
  }

  getById(data: any) {
    return (result: any) => {
      if (result.Item) {
        return {
          status: 200,
          payload: result.Item,
        };
      }
      return {
        status: 404,
        payload: { error: 'User not found' },
      };
    };
  }

  update(data: any) {
    const { user_id } = data;
    return (result: any) => {
      return {
        status: 200,
        payload: {
          user_id,
          message: 'User updated successfully',
        },
      };
    };
  }

  getUpvotedProjects(data: any) {
    return (result: any) => {
      if (result.Item) {
        const { user_id, upvoted_projects } = result.Item;
        return {
          status: 200,
          payload: {
            user_id,
            upvoted_projects: upvoted_projects.values,
          },
        };
      }
      return {
        status: 404,
        payload: { error: 'User not found' },
      };
    };
  }

  getBookmarkedProjects(data: any) {
    return (result: any) => {
      if (result.Item) {
        const { user_id, bookmarked_projects } = result.Item;
        return {
          status: 200,
          payload: {
            user_id,
            bookmarked_projects: bookmarked_projects.values,
          },
        };
      }
      return {
        status: 404,
        payload: { error: 'User not found' },
      };
    };
  }

  delete(data: any) {
    const { user_id } = data;
    return (result: any) => {
      return {
        status: 200,
        payload: {
          user_id,
          message: 'Project deleted successfully',
        },
      };
    };
  }

  pledge(data: any) {
    return (result: any) => {
      return {
        status: 200,
        payload: {
          result,
          message: 'Pledged successfully',
        },
      };
    };
  }

  subscribe(data: any) {
    return (result: any) => {
      return {
        status: 200,
        payload: {
          result,
          message: 'Subscribed successfully',
        },
      };
    };
  }

  addBookmarkedProject(data: any) {
    const { project_id } = data;
    return (result: any) => {
      return {
        status: 200,
        payload: {
          project_id,
          message: 'Project bookmarked successfully',
        },
      };
    };
  }

  // Controllers for intermediaries

  addUpvotedProject(data: any) {
    return (result: any) => { return {}; };
  }

  removeUpvotedProject(data: any) {
    return (result: any) => { return {}; };
  }

  checkExistence(data: any) {
    return (result: any) => {
      const flag = { user_exists: false };
      if (result.Item) {
        flag.user_exists = true;
      }
      return flag;
    };
  }

  storeAvatarUrl(data: any) {
    return (result: any) => {
      if (result.Item) {
        const { avatar_url } = result.Item;
        return { avatar_url };
      }
      console.log('Warning: User not found - attempt to retrieve user avatar_url gives empty map');
      return {};
    };
  }

  getScopes(data: any) {
    return (result: any) => {
      if (result.Item) {
        const { scopes } = result.Item;
        if (scopes === undefined) {
          return {}; // empty array
        }
        return { scopes: scopes.values };
      }
      console.log('Warning: User not found - attempt to retrieve user scopes gives empty map');
      return {};
    };
  }

}
