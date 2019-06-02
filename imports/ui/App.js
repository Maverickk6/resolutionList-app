import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Tasks } from '../api/tasks.js';
import Task from './Task.js';
import AccountsUIWrapper from './account.js';

// App component - represents the whole app
class App extends Component {
    constructor (props) {
      super(props);

      this.state = {
        hideCompleted: false,
      };
    };

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

Meteor.call('tasks.insert', text);

// Tasks.insert({
//   text,
//   createdAt: new Date(), // current time
//   owner: Meteor.userId(),     //id of the logged in user
//   username: Meteor.user().username,   //username of Logged in user
// });

// Clear form
ReactDOM.findDOMNode(this.refs.textInput).value = '';
}

toggleHideCompleted() {
  this.setState({
    hideCompleted: !this.state.hideCompleted,
  });
}

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked)
    }
    //former methods to return UI
    // return this.props.tasks.map((task) => (
    //   <Task key={task._id} task={task} />
    // ));

    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task key = {task._id}
              task = {task}
              showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
            <h1>Resolutions({ this.props.incompleteCount})</h1>

            <label className="hide-completed">
              <input type="checkbox"
                readOnly
                checked={this.state.hideCompleted}
                onClick={this.toggleHideCompleted.bind(this)}
                />
                Hide Completed Tasks
            </label>
            <AccountsUIWrapper />
            { this.props.currentUser ?
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new resolutions"
            />
          </form> : ''
        }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');

  return {
    //normal method

    //tasks: Tasks.find({}).fetch(),

    //to sort the order of list items from most recent in ascending order down to the oldest posts

    tasks: Tasks.find({}, {sort: {createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: {$ne: true} }).count(),
    currentUser: Meteor.user(),
  };
})(App);
