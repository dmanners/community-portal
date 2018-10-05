import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import WithAuth from './WithAuth';
import EditProjectDialog from './EditProjectDialog';
import EditButton from './buttons/EditButton';
import Message from './Message';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import StartsProjectButton from './projects/Stars';
import JoinProjectButton from './projects/Join';
import ContributorsList from './projects/ContributorsList';
import BookmarkButton from './projects/Bookmark';
import Progress from './projects/Progress';
import GithubButton from './buttons/GithubButton';
import SlackButton from './buttons/SlackButton';
import AuthorizedUserRole from './roles/AuthorizedUserRole';
import * as draftjsTohtml from "draftjs-to-html";

import { loadStarredProjects } from '../actions/user';
import { loadingProcessStart, loadingProcessEnd } from '../actions/loading';
import { loadProject } from '../actions/project';

const styles: any = (theme:any) => ({
  bookmark: {
    'margin-left': 'auto',
    [theme.breakpoints.down('md')]: {
      position: 'relative' as 'relative',
    },
  },
  cardAction: {
    'border-top': '1px solid #b9bdbd'
  },
  titleText: {
    [theme.breakpoints.down('sm')]: {
      width: '85%',
      fontSize: '1.2em',
    },
    [theme.breakpoints.up('sm')]: {
      width: '90%',
      fontSize: '1.5em',
    },
    [theme.breakpoints.up('md')]: {
      width: '92%',
      fontSize: '1.8em',
    },
    [theme.breakpoints.up('lg')]: {
      width: '94%',
      fontSize: '2em',
    },
    fontWeight: '500',
    margin: 'auto',
    'overflow-wrap': 'break-word',
  },
  grid: {
    [theme.breakpoints.down('sm')]: {
      width: '20rem',
    },
    [theme.breakpoints.up('sm')]: {
      width: '30rem',
    },
    [theme.breakpoints.up('md')]: {
      width: '40rem',
    },
    [theme.breakpoints.up('lg')]: {
      width: '55rem',
    },
    display: 'flex',
    'flex-direction': 'column',
    margin: 'auto',
    'margin-top': '1rem',
  },
  card: {
    'background-color': '#fff',
    'border-top': '1px solid #b9bdbd',
    'margin-top': '20px',
    'width': '100%',
    'border-radius': '0',
    'box-shadow': 'none'
  },
  chip: {
    margin: '0 1rem 0 0',
    borderRadius: '5px',
  },
  content: {
    margin: '0 1rem 1rem',
  },
  contributorDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '1rem',
  },
  progressDiv: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
    'margin-left': 'auto',
    position: 'relative' as 'relative',
  },
  row: {
    display: 'flex',
    width: '100%',
  },
  sidebar: {
    display: 'flex',
    'flex-direction': 'column',
  },
  technologies: {
    marginBottom: '1rem',
  },
  slack: {
    width: '3rem',
    height: '3rem',
    fill: '##27A2AA',
  },
  smallText: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  upvotes: {
    'font-size': '1rem',
    color: '#27A2AA',
    position: 'relative' as 'relative',
    right: '0.5rem',
  },
  description: {
    'font-size': '1rem',
    'font-family': 'system-ui',
  },
});

interface IProject {
  id: string;
  name: string;
  title?: string;
  description: string;
  technologies: [string];
  estimated: number;
  pledged?: number;
  due_date?: string;
  hours_goal?: number;
  github: string;
  slack?: string;
  size?: string;
  backers: [{
    name?: string,
    pledge?: number;
  }];
  created_date: string;
}

interface StateProps {
  project: IProject;
  user: any;
}

interface DispatchProps {
  loadProject: (project_id: string) => void;
  loadStarredProjects: any;
  loadingProcessStart: any;
  loadingProcessEnd: any;
}

interface ProjectDetailsProps {
  project_id: string;
  project?: any;
  user?: any;
  classes?: any;
}

interface ProjectDetailsState {
  editOpen: boolean;
  messageOpen: boolean;
  errorMessage: string;
}

const Edit = WithAuth(['owner', 'user'], ['write:project'])(EditButton);

export class ProjectDetails extends React.Component<any, ProjectDetailsState> {
  static defaultProps = {
    project: {
      contributors: {},
      bookmarked: {},
      estimated: 0,
      created: 0,
      technologies: [],
    }
  };

  constructor(props: ProjectDetailsProps & DispatchProps) {
    super(props);
    this.state = {
      editOpen: false,
      messageOpen: false,
      errorMessage: '',
    };
    this.toggleEdit = this.toggleEdit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMessageClose = this.handleMessageClose.bind(this);
  }

  calculateOpenTime(timestamp: number) {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const midnightStamp = +midnight;
    const dateDifference = Math.floor(((midnightStamp - timestamp) / 1000) / (3600 * 24));
    switch (dateDifference) {
      case -1:
        return 'Opened today';
      case 0:
        return 'Opened yesterday';
      default:
          var timestampDate = new Date(timestamp);
          var year = Math.floor((midnight.getTime() - timestampDate.getTime()) / (1000 * 3600 * 24 * 365));
          var months = (midnight.getMonth() + 12 * midnight.getFullYear()) - (timestampDate.getMonth() + 12 * timestampDate.getFullYear());
          months = months%12;

          var yearLabel = (year == 1) ? 'year' : 'years';
          var monthLabel = (months == 1) ? 'month' : 'months';

          if (dateDifference < 30) {
              return `Opened ${dateDifference + 1} days ago`;
          } else if (year > 0) {
              return 'Opened ' + year + ' ' + yearLabel + ' ' + months + ' ' + monthLabel + ' ago';
          } else {
              return 'Opened ' + months + ' ' + monthLabel + ' ago';
          }
    }
  }

  componentDidMount() {
    if (this.props.authorized) {
      this.props.loadingProcessStart('load_starred_projects', true);
      this.props.loadStarredProjects()
        .then(() => this.props.loadingProcessEnd('load_starred_projects'));
    }

    this.props.loadingProcessStart('load_project', true);
    this.props.loadProject(this.props.project_id)
      .then(() => this.props.loadingProcessEnd('load_project'));
  }

  componentWillReceiveProps(props:any) {
    if (!this.props.authorized && props.authorized) {
      this.props.loadingProcessStart('load_starred_projects', true);
      this.props.loadStarredProjects()
        .then(() => this.props.loadingProcessEnd('load_starred_projects'));
    }
  }

  toggleEdit() {
    this.setState((prevState: ProjectDetailsState) => ({
      editOpen: !prevState.editOpen,
    }));
  }

  handleMessageChange(message: string) {
    this.setState({
      errorMessage: message,
      messageOpen: true,
    });
  }

  handleMessageClose() {
    this.setState({
      messageOpen: false,
    });
  }

  onFailure(error: Error) {
    this.handleMessageChange(error.message);
  }

  getHtml = () => this.props.project.description ?
    draftjsTohtml(JSON.parse(this.props.project.description)) : '<b>Loading</b>';

  render() {
    const { classes } = this.props;
    const openedFor = this.calculateOpenTime(this.props.project.created);

    const html = {
      __html: this.getHtml(),
    };

    return (
      <div>
        {
          this.props.project.project_id &&
          <EditProjectDialog
            open={this.state.editOpen}
            toggleEdit={this.toggleEdit}
            project={this.props.project}
          />
        }
        <Grid
          container
          justify="center"
          className={classes.grid}
        >
          <div className={classes.row}>
            <Typography className={classes.titleText}>
              {this.props.project.name}
            </Typography>
            <AuthorizedUserRole requestLogin>
              <BookmarkButton project={this.props.project} bookmarkClass={classes.bookmark}/>
            </AuthorizedUserRole>
          </div>
          <Card className={classes.card}>
            <CardContent className={classes.content}>
              <Typography
                className={classes.description}
                dangerouslySetInnerHTML={html}
              />
              <div className={classes.row}>
                <div className={classes.sidebar}>
                  <div className={classes.technologies}>
                    {this.props.project.technologies && this.props.project.technologies.slice(0, 5).map((technology: any) => (
                      <Chip className={classes.chip} key={technology} label={technology} />
                    ))}
                  </div>
                  <Typography className={classes.smallText}>
                    {openedFor}
                  </Typography>
                  {/*<Typography className={classes.smallText}>
                    Size: {this.props.project.size}
                  </Typography>*/}
                </div>
                <Progress project={this.props.project} progressClass={this.props.classes.progressDiv} />
              </div>
              <ContributorsList project={this.props.project} contributorsListClass={this.props.classes.contributorDiv}/>
            </CardContent>
            <CardActions className={classes.cardAction}>
              <JoinProjectButton project={this.props.project} />
              <GithubButton url={this.props.project.github_address}/>
              <SlackButton url={this.props.project.slack_channel} />
              <Edit handler={this.toggleEdit} />
              <AuthorizedUserRole requestLogin>
                <StartsProjectButton project={this.props.project}/>
              </AuthorizedUserRole>
              <Typography className={classes.upvotes}>{this.props.project.upvotes}</Typography>
            </CardActions>
          </Card>
        </Grid>
        <Message
          message={this.state.errorMessage}
          open={this.state.messageOpen}
          handleClose={this.handleMessageClose}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: any, props: any) => {
  return {
    authorized: state.user.user_id,
    project: state.project.find((project:any)=> project.project_id === props.project_id),
    user: state.user,
  };
};

export default compose<{}, ProjectDetailsProps>(
  withStyles(styles, {name: 'ProjectDetails',}),
  connect<StateProps, DispatchProps, ProjectDetailsProps>(mapStateToProps, {
    loadStarredProjects,
    loadProject,
    loadingProcessStart,
    loadingProcessEnd
  }),
)(ProjectDetails);
