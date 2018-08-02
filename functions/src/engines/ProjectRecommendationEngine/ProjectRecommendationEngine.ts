interface ProjectRecommendationEngineInterface {
  getRecommendations(data: any): Promise<any>;
}

export default class ProjectRecommendationEngine implements ProjectRecommendationEngineInterface {
  getRecommendations(data: any): Promise<any> {
    const { last_visited, project_id } = data;
    return new Promise((resolve: any) => {
      return resolve({
        recommended: [],
      });
    });
  }
}
