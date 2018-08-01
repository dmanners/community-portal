import * as React from 'react';
import Button from '@material-ui/core/Button';

import { withStyles } from '@material-ui/core/styles';

const styles = {
  pledge: {
    color: '#27A2AA',
    'font-size': '1rem',
    'font-weight': '600',
    'text-transform': 'none',
  },
};

function ScheduleMeetingButton(props:any) {
  const { classes } = props;
  return (
    <Button className={classes.scheduleMeeting} onClick={props.handler}>Schedule a Meeting</Button>
  );
}

export default withStyles(styles)(ScheduleMeetingButton);