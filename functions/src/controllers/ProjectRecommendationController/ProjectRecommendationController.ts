import Counter from './../../custom/Counter';

interface ProjectRecommendationControllerInterface {
  getModel(data: any): (result: any) => any;
  getRecommendations(data: any): (result: any) => any;
  null(data: any): (result: any) => any;
}

function getSecondLevelCount(map: Map<string, any>, firstKey: string, secondKey: string) {
  if (map.has(firstKey)) {
    if (map.get(firstKey).has(secondKey)) return map.get(firstKey).get(secondKey);
  }
  return 0;
}

function getSignature(array: string[]) {
  return JSON.stringify(array);
}

function getStateFromSignature(signature: string) {
  return JSON.parse(signature);
}

function getNextStateSignature(signature: string, next: string) {
  const nextState = getStateFromSignature(signature).slice(1);
  nextState.push(next);
  return getSignature(nextState);
}

function delta(
  signature: string,
  nextProj: string,
  hitTransitionMap: any,
  missTransitionMap: any,
  values: Counter,
) {
  return (
    getSecondLevelCount(hitTransitionMap, signature, nextProj)
      - getSecondLevelCount(missTransitionMap, signature, nextProj)
  )
    * values.get(getNextStateSignature(signature, nextProj));
}

function getRandomElements(array: any[], n: number) {
  const shuffled = array.sort(() => .5 - Math.random());
  return shuffled.slice(0, n);
}

/** get random projects
  with a small probability, we randomly recommend projects to the user
  this is to encourage exporation in the reinforcement learning process
  which helps the model to better adapt to unknown states
  k represents the maximum number of projects to recommend
 */
function getRandomModel(projects: string[], k: number) {
  const projects = [...values.keys()];
  return (state: string[]) => {
    if (state.length === 0) return getRandomElements(projects, k);

    const projectPool: any = [];
    for (const project of projects) {
      if (project !== state[state.length-1]) projectPool.push(project);
    }
    return getRandomElements(projectPool, k);
  };
}

/** get the project IDs with highest trained values
  we fall back to this approach when we have not recorded any observations
  for the current sequence of projects viewed by the user
 */
function getValueModel(values: Map<string, number>, k: number) {
  return [...values.entries()]
    .sort(([k1, v1], [k2, v2]) => v2 - v1)
    .slice(0, k)
    .map(([k, v]) => k);
}

/**
  packageModel puts together the various components of the stored model
  it outputs a function that takes in a current state and generates up to k recommendations

  whenever possible, the model generates up to @param k recommendations based on the
  deltas of the project, where delta is calculated as (P(hit) - P(miss)) * value
  refer to the documentation for more details

  when past observations are not available, the model will recommend the projects with the
  highest values using getValueModel

  with a small probability @param epsilon the model randomly recommends k projects to the user
  this encourages the reinforcement learning model to explore unknown states
 */
function packageModel(
  values: Counter,
  hitTransitionMap: any,
  missTransitionMap: any,
  observedTransitions: any,
  k: number = 3,
  epsilon: number = 0.05,
) {
  return (state: string[]) => {
    try {
      const signature = getSignature(state);
      if (!observedTransitions.has(signature)) {
        return getRandomModel(values, k)(state);
      }

      const nextProjects = observedTransitions.get(signature);
      const nextStates = nextProjects.map((nextProj: string) => ({
        delta: delta(signature, nextProj, hitTransitionMap, missTransitionMap, values),
        id: nextProj,
      }));
      nextStates.sort((a: any, b: any) => a.delta < b.delta);
      return nextStates.slice(0, k).map((project: any) => project.id);

    } catch (e) {
      console.log('error:', e);
    }
  };
}

function buildSecondLevelMap(nestedList: any) {
  const result = new Map(nestedList);
  result.forEach((list: any, key: any, map: Map<any, any>) => {
    map.set(key, new Map(list));
  })
  return result;
}

export default class ProjectRecommendationController implements ProjectRecommendationControllerInterface {

  // intermediary controllers
  getModel(data: any) {
    return (result: any) => {
      try {
        if (typeof result === 'undefined') return { model: randomModel };

        let {
          values,
          hitTransitionMap,
          missTransitionMap,
          observedTransitions,
        } = JSON.parse(result.Body.toString());

        values = new Map(values);
        observedTransitions = new Map(observedTransitions);
        hitTransitionMap = buildSecondLevelMap(hitTransitionMap);
        missTransitionMap = buildSecondLevelMap(missTransitionMap);

        const model = packageModel(
          values,
          hitTransitionMap,
          missTransitionMap,
          observedTransitions,
        );

        return { model };
      } catch (e) {
        console.log(e);
      }
    };
  }

  getRecommendations(data: any) {
    return (result: any) => {
      const { recommended } = result;
      return { recommended };
    };
  }

  // special controllers
  null(data: any) {
    return (result: any) => {};
  }

}