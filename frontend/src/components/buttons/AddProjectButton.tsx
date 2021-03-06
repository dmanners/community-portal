import * as React from 'react';

import compose from 'recompose/compose';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Plus from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

interface IProps {
  classes?: any;
  onClick?: () => void;
  width?: any;
}

const styles = (theme:any) => ({
  button: {
    float: 'right' as 'right',
    'font-size': '1rem',
    'text-transform': 'capitalize',
    'background-color': '#F16321',
    '&:hover': {
      backgroundColor: '#FACCB7',
    },
    [theme.breakpoints.down('xs')]: {
      width: '1rem',
      'min-width': '0',
    },
  },
});

const addProjectButton: React.StatelessComponent<IProps> = (props: IProps) => (
  <Button
    id="addProject"
    color="secondary"
    aria-label="add"
    onClick={props.onClick}
    className={props.classes.button}>
    {isWidthUp('sm', props.width) ? 'New Project' : <Plus />}
  </Button>
);

export default compose<{}, IProps>(
  withStyles(styles, {
    name: 'addProjectButton',
  }), withWidth(),
)(addProjectButton);
